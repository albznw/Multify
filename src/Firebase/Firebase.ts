import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/functions';

// Initialize Firebase
var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
};

class Firebase {
  db: firebase.firestore.Firestore;
  functions: firebase.functions.Functions;

  constructor() {
    firebase.initializeApp(config);
    this.db = firebase.firestore();

    this.functions = firebase.functions();
    
    if(process.env.NODE_ENV === 'development') {
      console.log('[Firebase] Running in dev mode, setting firebase functions address to localhost:3001');
      this.functions.useFunctionsEmulator('http://localhost:3001');
    }
  }
}

export default Firebase;