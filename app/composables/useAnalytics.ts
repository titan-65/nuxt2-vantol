interface PostStats {
    slug: string
    title: string
    views: number
    comments: number
}

export const useAnalytics = () => {
    const nuxtApp = useNuxtApp()

    const totalViews = useState<number>('analytics:totalViews', () => 0)
    const totalComments = useState<number>('analytics:totalComments', () => 0)
    const totalSubscribers = useState<number>('analytics:totalSubscribers', () => 0)
    const popularPosts = useState<PostStats[]>('analytics:popularPosts', () => [])
    const loading = useState<boolean>('analytics:loading', () => false)

    const getDatabase = () => {
        if (import.meta.server) return null
        return nuxtApp.$firebaseDatabase as any
    }

    const fetchAnalytics = async (): Promise<void> => {
        if (import.meta.server) return

        const db = getDatabase()
        if (!db) return

        loading.value = true

        try {
            const { ref, get } = await import('firebase/database')

            // Fetch all posts data
            const postsRef = ref(db, 'posts')
            const postsSnapshot = await get(postsRef)

            // Fetch subscribers count
            const subscribersRef = ref(db, 'subscribers')
            const subscribersSnapshot = await get(subscribersRef)

            let viewsSum = 0
            let commentsSum = 0
            const postsList: PostStats[] = []

            if (postsSnapshot.exists()) {
                const postsData = postsSnapshot.val()

                Object.keys(postsData).forEach(slug => {
                    const post = postsData[slug]
                    const views = post.views || 0
                    const comments = post.comments ? Object.keys(post.comments).length : 0

                    viewsSum += views
                    commentsSum += comments

                    postsList.push({
                        slug,
                        title: formatSlugToTitle(slug),
                        views,
                        comments
                    })
                })
            }

            // Sort by views and take top 5
            postsList.sort((a, b) => b.views - a.views)
            popularPosts.value = postsList.slice(0, 5)

            totalViews.value = viewsSum
            totalComments.value = commentsSum

            // Count subscribers
            if (subscribersSnapshot.exists()) {
                totalSubscribers.value = Object.keys(subscribersSnapshot.val()).length
            } else {
                totalSubscribers.value = 0
            }

        } catch (error) {
            console.error('Fetch analytics error:', error)
        } finally {
            loading.value = false
        }
    }

    // Convert slug to readable title
    function formatSlugToTitle(slug: string): string {
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return {
        totalViews,
        totalComments,
        totalSubscribers,
        popularPosts,
        loading,
        fetchAnalytics
    }
}
