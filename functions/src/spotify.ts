import * as functions from 'firebase-functions';
import * as clientOauth2 from 'client-oauth2';
import * as admin from 'firebase-admin';
const SpotifyWebApi = require('spotify-web-api-node');

const config = {
  clientId: functions.config().spotify.id,
  clientSecret: functions.config().spotify.secret,
  authorizationUri: 'https://accounts.spotify.com/authorize/',
  accessTokenUri: 'https://accounts.spotify.com/api/token/',
  redirectUri: 'http://localhost:3000/login/',
  // redirectUri: 'https://multify-d5371.firebaseapp.com/login/',
  scopes: ['playlist-modify-public', 'user-modify-playback-state', 'user-read-email'],
};

// Oauth2 client
const oauthClient = new clientOauth2(config);

// Spotify client
const spotifyClient = new SpotifyWebApi();

// Firestore references
const partiesRef = admin.firestore().collection('parties');

export const authenticateSpotifyUser = functions.https.onCall(async (reqData, context) => {
  console.log("[authenticateSpotifyUser] 1.1");
  console.log("URL param", reqData.url);
  if (!reqData.url) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      "Missing 'url' parameter.",
    );
  }

  return oauthClient.code.getToken(reqData.url).then(res => {
    console.log(res);
    const { data } = res;
    return data;
  }).catch((err) => {
    console.error(err);
    throw new functions.https.HttpsError(
      'unknown',
      `Spotify error code: ${err.status}`,
    );
  });
});

export const refreshToken = functions.https.onCall(async (data, context) => {
  console.log("[refreshToken] 1.0");

  if (!data.refreshToken) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      "Missing 'refreshToken' parameter.",
    );
  }

  const token = oauthClient.createToken({});
  token.refreshToken = data.refreshToken;
  return token.refresh().then(res => {
    return res.data;
  }).catch((err) => {
    console.error(err);
    throw new functions.https.HttpsError(
      'unknown',
      `Spotify error code: '${err.status}`,
    );
  });;
});

const partyCodeGenerator = async () => {
  let partyNumbers = [];
  await partiesRef.select('code').get().then(partyCodes => {
    partyCodes.forEach(partyNum => {
      partyNumbers = [Number(partyNum.data().code), ...partyNumbers];
    });
  }).catch((err) => {
    console.error(err);
  });
  console.log("Numbers", partyNumbers);

  let done = false;
  let num = 0;
  while(!done) {
    num = Math.floor(Math.random() * 90000) + 10000;
    done = !partyNumbers.some(existingNumber => {
      return (existingNumber === num);
    })
  }
  console.log("Found unique number", num);
  return `${num}`;
}

export const createParty = functions.https.onCall(async (data, context) => {
  const { name, spotifyToken, spotifyId } = data;
  const promises = [];
  console.log('Create new party!', name);
  
  if (!name) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      "Missing 'name' parameter.",
    );
  }

  if (!spotifyToken) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      "Missing 'spotify_token' parameter.",
    );
  }

  // Get party code
  promises.push(partyCodeGenerator());

  // Create spotify playlist
  spotifyClient.setAccessToken(spotifyToken);
  promises.push(spotifyClient.createPlaylist(
    spotifyId,
    {name: 'Multify Playlist'}
  ));

  // Wait for all promises
  return Promise.all(promises).then(async () => {
    console.log('All promises resolved');
    promises.forEach((val, index) => {
      console.log(`Promise[${index}] `, JSON.stringify(val));
    })

    const code = promises[0];

    return admin.firestore().collection('parties').doc().create({
      code,
      name,
      spotifyToken,
      host: context.auth.uid,
    }).then(() => {
      return {code, name}
    });

  }).catch(error => {
    console.error('Something went wrong when waiting for promises', error);
    return error;
  });

  


});