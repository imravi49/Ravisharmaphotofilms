import firebaseConfig from './firebaseConfig';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

let app=null, auth=null, storage=null;
try{
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
}catch(e){
  console.warn('Firebase init failed', e);
}

const ALLOWED_EMAIL = 'ravi.rv73838@gmail.com';

export async function signInWithGoogle(){
  if(!auth) throw new Error('Firebase not configured');
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  if(user.email !== ALLOWED_EMAIL){
    await signOut(auth);
    throw new Error('This account is not allowed to access the admin panel.');
  }
  return result;
}
export async function signOutUser(){ if(!auth) return; return signOut(auth); }
export function onAuthChange(cb){ if(!auth) return; return onAuthStateChanged(auth, cb); }

export async function uploadFile(path, file){
  if(!storage) throw new Error('Firebase storage not configured');
  const r = storageRef(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

export { app as firebaseApp, auth as firebaseAuth, storage as firebaseStorage };
