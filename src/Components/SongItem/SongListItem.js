import React, { useState } from 'react';
import { compose } from 'recompose';
import {
  withStyles, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';
import Downvote from '../../Constants/Icons/Downvote';
import Upvote from '../../Constants/Icons/Upvote';


const ListItemHeight = 60;

const styles = theme => ({
  root: {
    height: `${ListItemHeight}px`,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit,
  },
  img: {
    maxHeight: `${ListItemHeight - 2 * theme.spacing.unit}px`,
    width: 'auto',
  },
  buttonSelected: {
    color: theme.palette.common.green,
  },
  buttonDeselected: {
    color: theme.palette.common.white,
  },
  primaryText: {
    color: theme.palette.common.white,
  },
  secondaryText: {
    color: theme.palette.common.white,
  },
});

const SongListItem = (props) => {
  const {
    classes, name, artists, album, albumUrl, // changeVotes,
  } = props;

  const [upvoted, setUpvote] = useState(false);
  const [downvoted, setDownvote] = useState(false);

  const concatArtists = artists.join(', ');

  const artistAndAlbum = `${concatArtists} - ${album}`;

  /**
   * Upvote and downvote takes place inside the list item file
   * to give imidiate feedback
   */
  const toggleUpvote = () => {
    if (downvoted) {
      setUpvote(true);
      setDownvote(false);
      // Add upvote and remove downvote
    } else if (upvoted) {
      setUpvote(false);
      // Remove upvote
    } else {
      setUpvote(true);
      // Add upvote
    }
  };
  const toggleDownvote = () => {
    if (upvoted) {
      setUpvote(false);
      setDownvote(true);
      // Add downvote and remove upvote
    } else if (downvoted) {
      setDownvote(false);
      // Remove downvote
    } else {
      setDownvote(true);
      // Add downvote
    }
  };

  return (
    <ListItem className={classes.root}>
      <img
        alt="Album art"
        className={classes.img}
        src={albumUrl}
      />
      <ListItemText
        primary={name}
        secondary={artistAndAlbum}
        primaryTypographyProps={{ className: classes.primaryText }}
      />
      <ListItemSecondaryAction>
        <IconButton
          aria-label="Downvote"
          onClick={() => toggleDownvote()}
        >
          <Downvote className={{
            [classes.buttonSelected]: downvoted,
            [classes.buttonDeselected]: !downvoted,
          }}
          />
        </IconButton>
        <IconButton
          aria-label="Upvote"
          onClick={() => toggleUpvote()}
        >
          <Upvote className={{
            [classes.buttonSelected]: upvoted,
            [classes.buttonDeselected]: !upvoted,
          }}
          />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>

  );
};

export default compose(
  withStyles(styles, { withTheme: true }),
)(SongListItem);
