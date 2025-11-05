// src/firebaseConfig.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAVrcrXjofDkAiNHUFnkZVegY-KtbwKabo',
  authDomain: 'monitoring-produksi-2f137.firebaseapp.com',
  projectId: 'monitoring-produksi-2f137',
  storageBucket: 'monitoring-produksi-2f137.firebasestorage.app',
  messagingSenderId: '669467452787',
  appId: '1:669467452787:web:6ab2fd11e32ff00de0d106',
  measurementId: 'G-NPF2SYNJ78',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
