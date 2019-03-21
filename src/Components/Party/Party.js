import React, { Component } from 'react';
import { compose } from 'recompose';
import classNames from 'classnames';
import {
  withStyles, AppBar, Toolbar, IconButton, Typography, Grid, Fab,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import MenuIcon from '@material-ui/icons/Menu';
// import { isMobile } from 'react-device-detect';
import DesktopDrawer from '../DesktopDrawer';

import { withFirebase } from '../../Firebase';
import Queue from '../Queue2';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
    overflowY: 'scroll',
    // flexGrow: '1', // might not be needed
    height: '100vh',
    backgroundColor: theme.palette.background.main,
  },
  hide: {
    display: 'none',
  },
  content: {
    flexGrow: 1,
    // padding: theme.spacing.unit * 3, // BREAKS CHILD COMPONENTS IN MY OPINION
  },
  toolbar: {
    ...theme.mixins.toolbar,
  },
  // Make sure app bar renders ABOVE desktop drawer
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },

  fab: {
    margin: theme.spacing.unit,
    color: theme.palette.common.lightBlack,
    backgroundColor: theme.palette.common.green,
  },
});

class Party extends Component {
  constructor(props) {
    super(props);

    const { location: { pathname } } = props;

    // /party/12345 = ["", "party", "5LJ0rnLKhslTmW357AbS"]
    // If there's more than 2 arguments, a party code was sent!
    const urlParams = pathname.split('/');
    const partyId = urlParams.length > 2 ? urlParams[2] : null;
    if (partyId) console.info('[Party] Party code:', partyId);

    this.state = {
      user: null,
      drawerOpen: false,
      partyId,
    };

    // TODO: Retrieve party from firestore IN CASE OF CODE
    // Fells like this should be in comp. did update/mount
    /* const { partyId } = this.state;
    const [party, setParty] = useState({});
    useEffect(() => {
      const handleNewSongs = (songs) => {
        const newItems = [];
        songs.forEach((song) => {
          console.log('[QueueList] Found song: ', song.data().spotifyUri);
          const item = {
            artist: song.data().artist,
            title: song.data().title,
            album: song.data().album,
            picture: song.data().picture,
            spotifyUri: song.data().spotifyUri,
          };
          newItems.push(item);
        });
        setItems(newItems);
      };

      const unsubscribe = firebase.db.collection('parties').doc(partyId)
        .onSnapshot(handleNewSongs);

      return () => {
        unsubscribe();
      };
    }, []); */
  }

  /*
    Things that should be implemented in this component (some things will
    be broken out in the future)

    Drawer      - ish done
    Queue list  - ish done
    Fab button (add tracks, search for tracks) - done
    TODO: Add button in search so we can go back to queue

    // later
    TODO: Display party code on top (in case youre logged in as party amdin)
    TODO: Add share button to sidebar
    TODO: Customize sidebar for admin and anonomous users
    TODO: Spacing 0 to remove scroll issues?
  */

  handleDrawerOpen = () => {
    this.setState({ drawerOpen: true });
  };

  handleDrawerClose = () => {
    this.setState({ drawerOpen: false });
  };

  render() {
    const { classes } = this.props;
    const { drawerOpen, partyId } = this.state;
    const isMobile = true;

    return (
      <div className={classes.root}>
        <AppBar
          position="fixed"
          className={classNames(classes.appBar, {
            [classes.appBarShift]: drawerOpen,
          })}
        >
          <Toolbar disableGutters={!drawerOpen}>
            <IconButton
              aria-label="Open dawer"
              color="inherit"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, {
                [classes.hide]: drawerOpen,
              })}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5">
              Party {/* TODO: Take name from party */}
            </Typography>
          </Toolbar>
        </AppBar>

        {isMobile ? (
          null
        ) : (
          <DesktopDrawer
            open={drawerOpen}
            handleClose={this.handleDrawerClose}
          />
        )}


        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Grid
            container
            justify="center"
          >
            <Grid item xs={12} sm={8} md={6}>
              <Queue />
              <Grid
                container
                direction="row"
                justify="flex-end"
                alignItems="flex-end"
              >
                <Fab
                  aria-label="Add"
                  className={classes.fab}
                >
                  <AddIcon />
                </Fab>
              </Grid>
            </Grid>
          </Grid>
        </main>
      </div>
    );
  }
}

export default compose(
  withStyles(styles, { withTheme: true }),
  withFirebase,
)(Party);
