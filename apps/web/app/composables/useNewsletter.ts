interface Subscriber {
    email: string
    subscribedAt: number
    source: string
}

export const useNewsletter = () => {
    const nuxtApp = useNuxtApp()

    const subscribers = useState<Subscriber[]>('newsletter:subscribers', () => [])
    const loading = useState<boolean>('newsletter:loading', () => false)
    const totalCount = useState<number>('newsletter:count', () => 0)

    // Create a hash of the email for use as a Firebase key
    const hashEmail = (email: string): string => {
        return email.toLowerCase().replace(/[.#$[\]]/g, '_')
    }

    const getDatabase = () => {
        if (import.meta.server) return null
        return nuxtApp.$firebaseDatabase as any
    }

    const subscribe = async (email: string, source: string = 'blog'): Promise<{ success: boolean; message: string }> => {
        if (import.meta.server) {
            return { success: false, message: 'Cannot subscribe on server' }
        }

        const db = getDatabase()
        if (!db) {
            return { success: false, message: 'Database not available' }
        }

        const emailHash = hashEmail(email)

        try {
            const { ref, get, set } = await import('firebase/database')
            const subscriberRef = ref(db, `subscribers/${emailHash}`)

            // Check if already subscribed
            const snapshot = await get(subscriberRef)

            if (snapshot.exists()) {
                return { success: false, message: 'This email is already subscribed!' }
            }

            // Add new subscriber
            await set(subscriberRef, {
                email: email.toLowerCase(),
                subscribedAt: Date.now(),
                source
            })

            return { success: true, message: 'Thanks for subscribing!' }
        } catch (error: any) {
            console.error('Subscribe error:', error)
            return { success: false, message: error.message || 'Failed to subscribe' }
        }
    }

    const fetchSubscribers = async (limit: number = 50): Promise<void> => {
        if (import.meta.server) return

        const db = getDatabase()
        if (!db) return

        loading.value = true

        try {
            const { ref, get, query, orderByChild, limitToLast } = await import('firebase/database')
            const subscribersRef = ref(db, 'subscribers')
            const subscribersQuery = query(subscribersRef, orderByChild('subscribedAt'), limitToLast(limit))

            const snapshot = await get(subscribersQuery)

            if (snapshot.exists()) {
                const data = snapshot.val()
                const list: Subscriber[] = []

                Object.keys(data).forEach(key => {
                    list.push(data[key])
                })

                // Sort by most recent first
                list.sort((a, b) => b.subscribedAt - a.subscribedAt)
                subscribers.value = list
                totalCount.value = list.length
            } else {
                subscribers.value = []
                totalCount.value = 0
            }
        } catch (error) {
            console.error('Fetch subscribers error:', error)
        } finally {
            loading.value = false
        }
    }

    const exportCSV = (): void => {
        if (subscribers.value.length === 0) return

        const headers = ['Email', 'Subscribed At', 'Source']
        const rows = subscribers.value.map((sub: Subscriber) => [
            sub.email,
            new Date(sub.subscribedAt).toISOString(),
            sub.source
        ])

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`
        a.click()

        URL.revokeObjectURL(url)
    }

    return {
        subscribers,
        loading,
        totalCount,
        subscribe,
        fetchSubscribers,
        exportCSV
    }
}
