import type { FirebaseApp } from 'firebase/app'
import type { Auth, GoogleAuthProvider } from 'firebase/auth'
import type { Database } from 'firebase/database'

declare module '#app' {
  interface NuxtApp {
    $firebaseApp: FirebaseApp
    $firebaseAuth: Auth
    $firebaseDatabase: Database
    $firebaseGoogleProvider: GoogleAuthProvider
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $firebaseApp: FirebaseApp
    $firebaseAuth: Auth
    $firebaseDatabase: Database
    $firebaseGoogleProvider: GoogleAuthProvider
  }
}

export { }
