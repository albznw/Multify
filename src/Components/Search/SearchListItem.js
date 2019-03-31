import React from 'react';
import {
  withStyles,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
} from '@material-ui/core';
import { compose } from 'recompose';
import Add from '../../Constants/Icons/Add';

const styles = theme => ({
  listText: {
    color: theme.palette.secondary.main,
  },
  listSubText: {
    color: theme.palette.common.lightGrey,
  },
});

const SearchListItem = (props) => {
  const {
    album,
    artists,
    id,
    name,
    uri,
    classes,
    addTrack,
  } = props;

  // Todo: fix space after last artist
  return (
    <ListItem>
      <ListItemText
        disableTypography
        primary={(
          <Typography
            className={classes.listText}
          >
            {name}
          </Typography>
        )}
        secondary={(
          <Typography
            className={classes.listSubText}
          >
            {`${album.name} -${artists.map(artist => ` ${artist.name}`)}`}
          </Typography>
        )}
      />
      <ListItemSecondaryAction>
        <IconButton
          onClick={() => addTrack({
            id,
            artists,
            name,
            album,
          }, uri)}
        >
          <Add />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default compose(
  withStyles(styles),
)(SearchListItem);
