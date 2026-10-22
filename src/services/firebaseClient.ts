/**
 * Firebase client setup for Balakutak Master.
 *
 * Firebase web configuration is public by design. Access control belongs in
 * Firebase Authentication and Firestore Security Rules, never in this file.
 */
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB-y2HjpTXuQIW3ZFoaEf5UNizSnpKmypg',
  authDomain: 'balakutak-9116b.firebaseapp.com',
  projectId: 'balakutak-9116b',
  storageBucket: 'balakutak-9116b.firebasestorage.app',
  messagingSenderId: '27827273719',
  appId: '1:27827273719:web:c3ab73208eba853884f8f2',
  measurementId: 'G-K0G81V8YWK',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
