import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
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

export async function signInWithGoogle(): Promise<void> {
  await signInWithRedirect(auth, googleProvider)
}

export async function handleRedirectResult(): Promise<FirebaseUser | null> {
  const result = await getRedirectResult(auth)
  if (result) return toFirebaseUser(result.user)
  return null
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
