import { auth, db } from '../firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

// Fungsi login user
export const loginUser = async (email, password) => {
  try {
    // Login ke Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    )
    const uid = userCredential.user.uid

    // Ambil data user dari Firestore berdasarkan UID
    const userDoc = await getDoc(doc(db, 'users', uid))

    if (userDoc.exists()) {
      const userData = userDoc.data()
      return { ...userData, uid } // Kembalikan data user + UID
    } else {
      throw new Error('Data user tidak ditemukan di Firestore.')
    }
  } catch (error) {
    console.error('Login error:', error.message)
    throw error
  }
}
