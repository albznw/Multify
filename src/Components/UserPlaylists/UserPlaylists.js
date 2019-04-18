import React from 'react';
import {
  withStyles,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  List,
  Grid,
} from '@material-ui/core';
import { compose } from 'recompose';
import Add from '../../Constants/Icons/Add';
import Left from '../../Constants/Icons/Left';
import Right from '../../Constants/Icons/Right';
import NotificationBar from '../NotificationBar';
import { withSpotify } from '../../Spotify';

const styles = theme => ({
  root: {
    width: '95%',
  },
  listText: {
    color: theme.palette.secondary.main,
  },
  listSubText: {
    color: theme.palette.common.lightGrey,
  },
  img: {
    maxHeight: `${5 * theme.spacing.unit}px`,
    width: 'auto',
  },
  directionButton: {
    color: theme.palette.secondary.main,
  },
});

class UserPlaylists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playlists: [],
      next: '',
      prev: '',
      hasNext: false,
      hasPrev: false,
      notifs: [],
    };
    this.getPlaylists();
  }

  getPlaylists = () => {
    const { spotify } = this.props;

    spotify.client.getUserPlaylists()
      .then((data) => {
        if (data.next) {
          this.setState({
            playlists: data.items,
            next: data.next,
            hasNext: true,
          });
        } else {
          this.setState({
            playlists: data.items,
          });
        }
      });
  };

  switchPlaylistsViewed = (url) => {
    const { spotify } = this.props;

    spotify.client.getGeneric(url)
      .then((data) => {
        let next = false;
        let prev = false;
        if (data.next) {
          next = true;
        }
        if (data.previous) {
          prev = true;
        }
        this.setState({
          playlists: data.items,
          hasNext: next,
          hasPrev: prev,
          next: next ? data.next : '',
          prev: prev ? data.previous : '',
        });
      });
  };

  selectFallbackPlaylist = (id) => {
    const { spotify } = this.props;
    spotify.addFallbackTracks(id);
  };

  render() {
    const { classes } = this.props;
    const {
      playlists,
      hasNext,
      next,
      hasPrev,
      prev,
      notifs,
    } = this.state;

    return (
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="flex-start"
      >
        <List
          dense={false}
          className={classes.root}
        >
          {playlists.map((list) => {
            let image = '';
            if (list.images.length <= 0) {
              image = 'https://spotify.i.lithium.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=1.0';
            } else {
              image = list.images[0].url;
            }
            return (
              <ListItem
                key={list.id}
                divider
              >
                <img
                  alt="Album art"
                  className={classes.img}
                  src={image}
                />
                <ListItemText
                  disableTypography
                  primary={(
                    <Typography
                      className={classes.listText}
                      noWrap
                    >
                      {list.name}
                    </Typography>
                  )}
                  secondary={(
                    <Typography
                      className={classes.listSubText}
                      noWrap
                    >
                      {`Created by: ${list.owner.display_name}`}
                    </Typography>
                    )}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => {
                      this.selectFallbackPlaylist(list.id);
                      this.setState({
                        notifs: [{
                          message: 'Tracks added from fallback playlist',
                          key: new Date().getTime(),
                        }, ...notifs],
                      });
                    }}
                  >
                    <Add />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <Grid
          container
          direction="row"
          justify="space-around"
          alignItems="center"
        >
          <Button
            variant="contained"
            disabled={!hasPrev}
            onClick={() => {
              this.switchPlaylistsViewed(prev);
              window.scrollTo(0, 0);
            }}
            className={classes.directionButton}
            color="primary"
          >
            <Left />
            Previous
          </Button>
          <Button
            variant="contained"
            disabled={!hasNext}
            onClick={() => {
              this.switchPlaylistsViewed(next);
              window.scrollTo(0, 0);
            }}
            className={classes.directionButton}
            color="priamry"
          >
            Next
            <Right />
          </Button>
        </Grid>
        <NotificationBar queue={notifs} />
      </Grid>
    );
  }
}

export default compose(
  withSpotify,
  withStyles(styles),
)(UserPlaylists);
