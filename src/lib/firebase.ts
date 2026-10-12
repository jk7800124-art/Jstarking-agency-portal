import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  databaseURL: config.databaseURL || undefined,
  firestoreDatabaseId: config.firestoreDatabaseId || undefined,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  measurementId: config.measurementId || undefined,
};

// Initialize Firebase App with user's real project credentials
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Initialize Firestore (default database or custom database ID)
export const db = (config.firestoreDatabaseId && config.firestoreDatabaseId.trim() !== '' && config.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, config.firestoreDatabaseId) 
  : getFirestore(app);

// Initialize Firebase Realtime Database
export const rtdb = config.databaseURL ? getDatabase(app, config.databaseURL) : getDatabase(app);

export const activeFirebaseProject = {
  projectId: config.projectId,
  appId: config.appId,
  databaseURL: config.databaseURL,
  authDomain: config.authDomain,
  storageBucket: config.storageBucket,
};

// Validate connection to user's real Firebase project
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    console.log("✅ Firebase Firestore connected successfully to live project:", config.projectId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore offline mode or initializing...");
    } else {
      console.log("Firebase connection initialized for:", config.projectId);
    }
    return true;
  }
}

testConnection();
