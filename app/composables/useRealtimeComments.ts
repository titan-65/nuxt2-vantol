import { ref as dbRef, onValue, push, remove, set, serverTimestamp, query, orderByChild, off } from 'firebase/database'
import type { Database, DatabaseReference, Unsubscribe } from 'firebase/database'

export interface Comment {
    id: string
    text: string
    authorName: string
    authorEmail: string
    authorPhoto: string
    createdAt: number
}

export const useRealtimeComments = (slug: string) => {
    const nuxtApp = useNuxtApp()
    const { user, isAdmin } = useFirebaseAuth()

    const comments = useState<Comment[]>(`comments:${slug}`, () => [])
    const loading = useState<boolean>(`comments:loading:${slug}`, () => true)

    let unsubscribe: Unsubscribe | null = null

    const init = () => {
        if (import.meta.server) return

        const db = nuxtApp.$firebaseDatabase as Database
        const commentsRef = dbRef(db, `posts/${slug}/comments`)
        const commentsQuery = query(commentsRef, orderByChild('createdAt'))

        unsubscribe = onValue(commentsQuery, (snapshot) => {
            const data = snapshot.val()
            if (!data) {
                comments.value = []
                loading.value = false
                return
            }

            // Convert object to array with IDs
            const commentsList: Comment[] = Object.entries(data).map(([id, value]: [string, any]) => ({
                id,
                text: value.text,
                authorName: value.authorName,
                authorEmail: value.authorEmail,
                authorPhoto: value.authorPhoto,
                createdAt: value.createdAt
            }))

            // Sort by creation time (oldest first)
            commentsList.sort((a, b) => a.createdAt - b.createdAt)
            comments.value = commentsList
            loading.value = false
        })
    }

    const addComment = async (text: string) => {
        if (!user.value) {
            throw new Error('Must be logged in to comment')
        }

        const db = nuxtApp.$firebaseDatabase as Database
        const commentsRef = dbRef(db, `posts/${slug}/comments`)
        const newCommentRef = push(commentsRef)

        await set(newCommentRef, {
            text: text.trim(),
            authorName: user.value.displayName || 'Anonymous',
            authorEmail: user.value.email || '',
            authorPhoto: user.value.photoURL || '',
            createdAt: serverTimestamp()
        })
    }

    const deleteComment = async (commentId: string) => {
        if (!user.value) return

        const db = nuxtApp.$firebaseDatabase as Database
        const commentRef = dbRef(db, `posts/${slug}/comments/${commentId}`)

        // Check if user owns the comment or is admin
        const commentData = comments.value.find(c => c.id === commentId)
        if (!commentData) return

        const canDelete = isAdmin.value || commentData.authorEmail === user.value.email
        if (!canDelete) {
            throw new Error('Not authorized to delete this comment')
        }

        await remove(commentRef)
    }

    const cleanup = () => {
        if (unsubscribe) {
            unsubscribe()
            unsubscribe = null
        }
    }

    return {
        comments,
        loading,
        init,
        addComment,
        deleteComment,
        cleanup
    }
}
