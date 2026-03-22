import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from './config'

export interface FirebaseUser {
  uid: string
  email: string
  displayName: string
  photoURL: string
}

function toFirebaseUser(user: User): FirebaseUser {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '익명',
    photoURL: user.photoURL ?? '',
  }
}

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const credential = await signInWithPopup(auth, googleProvider)
  return toFirebaseUser(credential.user)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export function onAuthChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? toFirebaseUser(user) : null)
  })
}
