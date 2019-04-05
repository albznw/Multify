import React, { useEffect, useState } from 'react';
import { compose } from 'recompose';
import { withStyles, Typography, List } from '@material-ui/core';
import { withFirebase } from '../../Firebase';
import { SongListItem, SongItem } from '../SongItem';

const styles = theme => ({
  root: {
    // display: 'flex',
    // flexGrow: '1',
    height: `calc(100% - ${theme.spacing.unit * 8}px)`,
    padding: theme.spacing.unit,
  },
  text: {
    color: theme.palette.common.white,
  },
});

const Queue = (props) => {
  const { classes, partyId, firebase } = props;

  const [songs, setSongs] = useState([]);

  const compare = (track1, track2) => {
    if (track1.averageLikes > track2.averageLikes) {
      return -1;
    }
    if (track1.averageLikes < track2.averageLikes) {
      return 1;
    }
    return 0;
  };

  const queue = firebase.db
    .collection('parties')
    .doc(partyId)
    .collection('queue');

  useEffect(() => {
    const unsubscribeParty = firebase.partyQueueRef(partyId).onSnapshot((snap) => {
      const uid = firebase.currentUser().uid;
      const newSongs = [];
      // snap.forEach(songDoc => newSongs.push(songDoc.data()));
      snap.forEach((songDoc) => {
        let totLikes = 0;
        let totDislikes = 0;
        const id = songDoc.data().id;
        const songObj = songDoc.data();
        queue.doc(id).collection('likes').get()
          .then((likesCol) => {
            likesCol.forEach(() => {
              totLikes += 1;
            });
          })
          .catch((err) => {
            console.error('[Queue] Error getting total likes', err);
          })
          .then(() => {
            queue.doc(id).collection('dislikes').get()
              .then((dislikesCol) => {
                dislikesCol.forEach(() => {
                  totDislikes += 1;
                });
              })
              .catch((err) => {
                console.error('[Queue] Error getting total dislikes', err);
              })
              .then(() => {
                // Unnecessary then? No race condition here?
                songObj.averageLikes = totLikes + totDislikes;
              })
              .then(() => {
                queue.doc(id).collection('likes').doc(uid).get()
                  .then((like) => {
                    if (like.exists) {
                      songObj.liked = true;
                      songObj.disliked = false;
                      newSongs.push(songObj);
                      newSongs.sort(compare);
                      setSongs(songs.concat(newSongs));
                    } else {
                      queue.doc(id).collection('dislikes').doc(uid).get()
                        .then((dislike) => {
                          if (dislike.exists) {
                            songObj.liked = false;
                            songObj.disliked = true;
                            newSongs.push(songObj);
                            newSongs.sort(compare);
                            setSongs(songs.concat(newSongs));
                          } else {
                            songObj.liked = false;
                            songObj.disliked = false;
                            newSongs.push(songObj);
                            newSongs.sort(compare);
                            setSongs(songs.concat(newSongs));
                          }
                        })
                        .catch((err) => {
                          console.error('[Queue] Error checking for dislikes', err);
                        });
                    }
                  })
                  .catch((err) => {
                    console.error('[Queue] Error checking for likes', err);
                  });
              });
          });
      });
      // setSongs(songs.concat(newSongs));
    });

    return () => {
      unsubscribeParty();
    };
  }, []);

  // Make this more DRY?
  const changeVote = (up, down, id) => {
    const vote = queue.doc(id);
    const uid = firebase.currentUser().uid;
    if (up) {
      vote.collection('likes').doc(uid).set({})
        .then(() => {
          console.log('[Queue] Upvote added');
        })
        .catch((err) => {
          console.error('[Queue] Error adding upvote', err);
        });
    } else {
      vote.collection('likes').doc(uid).delete()
        .then(() => {
          console.log('[Queue] Upvote deleted');
        })
        .catch((err) => {
          console.error('[Queue] Error deleting upvote', err);
        });
    }
    if (down) {
      vote.collection('dislikes').doc(uid).set({})
        .then(() => {
          console.log('[Queue] Downvote added');
        })
        .catch((err) => {
          console.error('[Queue] Error adding downvote', err);
        });
    } else {
      vote.collection('dislikes').doc(uid).delete()
        .then(() => {
          console.log('[Queue] Downvote deleted');
        })
        .catch((err) => {
          console.error('[Queue] Error deleting downvote', err);
        });
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h6" className={classes.text}>
        Now playing
      </Typography>

      <List>
        <SongItem
          key="Give you up"
          name="Give you up"
          artists={['Rick']}
          album="pW0ned"
          albumUrl="https://www.femalefirst.co.uk/image-library/square/1000/r/rick-astley-whenever-you-need-somebody-album-cover.jpg"
        />
      </List>

      <Typography variant="h6" className={classes.text}>
        Queue
      </Typography>

      <List>
        {songs.map(song => (
          <SongListItem
            key={song.name}
            name={song.name}
            artists={song.artists}
            album={song.album.name}
            albumUrl={song.album.images[2].url}
            id={song.id}
            changeVote={changeVote}
            upvoteBefore={song.liked}
            downvoteBefore={song.disliked}
          />
        ))}
      </List>
    </div>
  );
};

export default compose(
  withStyles(styles),
  withFirebase,
)(Queue);
