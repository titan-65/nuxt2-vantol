import { ref as dbRef, onValue, push, remove, set, onDisconnect, serverTimestamp, off } from 'firebase/database'
import type { Database, Unsubscribe } from 'firebase/database'

function generateVisitorId(): string {
    if (import.meta.server) return ''

    let visitorId = sessionStorage.getItem('firebase:visitorId')
    if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem('firebase:visitorId', visitorId)
    }
    return visitorId
}

export const usePresence = (slug: string) => {
    const nuxtApp = useNuxtApp()

    const activeReaders = useState<number>(`presence:${slug}`, () => 0)
    const isConnected = useState<boolean>(`presence:connected:${slug}`, () => false)

    let presenceUnsubscribe: Unsubscribe | null = null
    let connectionUnsubscribe: Unsubscribe | null = null
    let myPresenceRef: ReturnType<typeof dbRef> | null = null

    const init = () => {
        if (import.meta.server) return

        const db = nuxtApp.$firebaseDatabase as Database
        const presenceRef = dbRef(db, `posts/${slug}/presence`)

        // Listen for presence changes
        presenceUnsubscribe = onValue(presenceRef, (snapshot) => {
            const data = snapshot.val()
            activeReaders.value = data ? Object.keys(data).length : 0
        })
    }

    const joinPost = () => {
        if (import.meta.server) return

        const visitorId = generateVisitorId()
        if (!visitorId) return

        const db = nuxtApp.$firebaseDatabase as Database
        myPresenceRef = dbRef(db, `posts/${slug}/presence/${visitorId}`)
        const connectedRef = dbRef(db, '.info/connected')

        connectionUnsubscribe = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                isConnected.value = true

                // Set up onDisconnect to remove presence when disconnected
                onDisconnect(myPresenceRef!).remove()

                // Mark as present
                set(myPresenceRef!, {
                    joinedAt: serverTimestamp()
                })
            } else {
                isConnected.value = false
            }
        })
    }

    const leavePost = () => {
        if (import.meta.server) return
        if (!myPresenceRef) return

        // Remove presence immediately
        remove(myPresenceRef)
        myPresenceRef = null
    }

    const cleanup = () => {
        leavePost()

        if (presenceUnsubscribe) {
            presenceUnsubscribe()
            presenceUnsubscribe = null
        }
        if (connectionUnsubscribe) {
            connectionUnsubscribe()
            connectionUnsubscribe = null
        }
    }

    return {
        activeReaders,
        isConnected,
        init,
        joinPost,
        leavePost,
        cleanup
    }
}
