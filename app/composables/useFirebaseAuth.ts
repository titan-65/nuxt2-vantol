import type { User } from 'firebase/auth'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'

let initPromise: Promise<User | null> | null = null
let unsubscribe: (() => void) | null = null

export const useFirebaseAuth = () => {
  const nuxtApp = useNuxtApp()

  const config = useRuntimeConfig()

  const user = useState<User | null>('firebase:user', () => null)
  const loading = useState<boolean>('firebase:loading', () => true)

  const adminEmails = computed(() => {
    const raw = (config.public.adminEmails || '').trim()
    if (!raw) return [] as string[]

    return raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  })

  const isAdmin = computed(() => {
    const email = user.value?.email?.toLowerCase()
    if (!email) return false
    return adminEmails.value.includes(email)
  })

  const init = () => {
    if (initPromise) return initPromise

    initPromise = new Promise(async (resolve) => {
      const auth = nuxtApp.$firebaseAuth as any

      if (unsubscribe) {
        resolve(user.value)
        return
      }

      // Handle redirect result if returning from Google sign-in
      try {
        await getRedirectResult(auth)
      } catch (error) {
        console.warn('Redirect result error:', error)
      }

      unsubscribe = onAuthStateChanged(auth, (nextUser: User | null) => {
        user.value = nextUser
        loading.value = false
        resolve(nextUser)
      })
    })

    return initPromise
  }

  const signInWithGoogle = async () => {
    const auth = nuxtApp.$firebaseAuth as any
    const provider = nuxtApp.$firebaseGoogleProvider as any
    await signInWithRedirect(auth, provider)
  }

  const signOutUser = async () => {
    const auth = nuxtApp.$firebaseAuth as any
    await signOut(auth)
  }

  return {
    user,
    loading,
    isAdmin,
    init,
    signInWithGoogle,
    signOut: signOutUser
  }
}
