const VISITOR_KEY = 'firebase:visitorId'

function getVisitorId(): string {
    if (import.meta.server) return ''

    let visitorId = sessionStorage.getItem(VISITOR_KEY)
    if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
        sessionStorage.setItem(VISITOR_KEY, visitorId)
    }
    return visitorId
}

export const useReactions = (slug: string) => {
    const nuxtApp = useNuxtApp()

    const likeCount = useState<number>(`likes:${slug}`, () => 0)
    const hasLiked = useState<boolean>(`hasLiked:${slug}`, () => false)
    const loading = useState<boolean>(`likes:loading:${slug}`, () => true)

    const getDatabase = () => {
        if (import.meta.server) return null
        return nuxtApp.$firebaseDatabase as any
    }

    const init = async () => {
        if (import.meta.server) return

        const db = getDatabase()
        if (!db) return

        const visitorId = getVisitorId()

        try {
            const { ref, onValue, get } = await import('firebase/database')

            // Listen for total likes count
            const likesRef = ref(db, `posts/${slug}/likes`)
            onValue(likesRef, (snapshot) => {
                if (snapshot.exists()) {
                    likeCount.value = Object.keys(snapshot.val()).length
                } else {
                    likeCount.value = 0
                }
                loading.value = false
            })

            // Check if current visitor has liked
            const visitorLikeRef = ref(db, `posts/${slug}/likes/${visitorId}`)
            const visitorSnapshot = await get(visitorLikeRef)
            hasLiked.value = visitorSnapshot.exists()

        } catch (error) {
            console.error('Reactions init error:', error)
            loading.value = false
        }
    }

    const toggleLike = async () => {
        if (import.meta.server) return

        const db = getDatabase()
        if (!db) return

        const visitorId = getVisitorId()

        try {
            const { ref, set, remove } = await import('firebase/database')
            const likeRef = ref(db, `posts/${slug}/likes/${visitorId}`)

            if (hasLiked.value) {
                // Remove like
                await remove(likeRef)
                hasLiked.value = false
            } else {
                // Add like
                await set(likeRef, {
                    likedAt: Date.now()
                })
                hasLiked.value = true
            }
        } catch (error) {
            console.error('Toggle like error:', error)
        }
    }

    return {
        likeCount,
        hasLiked,
        loading,
        init,
        toggleLike
    }
}
