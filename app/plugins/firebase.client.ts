import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const firebaseConfig = config.public.firebase

  if (!firebaseConfig?.apiKey || !firebaseConfig?.authDomain || !firebaseConfig?.projectId || !firebaseConfig?.appId) {
    throw new Error(
      'Missing Firebase configuration. Set NUXT_PUBLIC_FIREBASE_API_KEY, NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NUXT_PUBLIC_FIREBASE_PROJECT_ID, and NUXT_PUBLIC_FIREBASE_APP_ID.'
    )
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const database = getDatabase(app)
  const googleProvider = new GoogleAuthProvider()

  return {
    provide: {
      firebaseApp: app,
      firebaseAuth: auth,
      firebaseDatabase: database,
      firebaseGoogleProvider: googleProvider
    }
  }
})
