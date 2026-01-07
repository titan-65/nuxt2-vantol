interface Bookmark {
    slug: string
    title: string
    savedAt: number
}

const BOOKMARKS_KEY = 'blog:bookmarks'

export const useBookmarks = () => {
    const bookmarks = useState<Bookmark[]>('bookmarks', () => [])

    const loadBookmarks = (): void => {
        if (import.meta.server) return
        try {
            const stored = localStorage.getItem(BOOKMARKS_KEY)
            bookmarks.value = stored ? JSON.parse(stored) : []
        } catch {
            bookmarks.value = []
        }
    }

    const saveBookmarks = (): void => {
        if (import.meta.server) return
        try {
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks.value))
        } catch {
            // Ignore storage errors
        }
    }

    const isBookmarked = (slug: string): boolean => {
        return bookmarks.value.some(b => b.slug === slug)
    }

    const toggleBookmark = (slug: string, title: string): boolean => {
        if (import.meta.server) return false

        const index = bookmarks.value.findIndex(b => b.slug === slug)

        if (index >= 0) {
            // Remove bookmark
            bookmarks.value.splice(index, 1)
            saveBookmarks()
            return false
        } else {
            // Add bookmark
            bookmarks.value.unshift({
                slug,
                title,
                savedAt: Date.now()
            })
            saveBookmarks()
            return true
        }
    }

    const removeBookmark = (slug: string): void => {
        const index = bookmarks.value.findIndex(b => b.slug === slug)
        if (index >= 0) {
            bookmarks.value.splice(index, 1)
            saveBookmarks()
        }
    }

    // Initialize on client
    if (!import.meta.server) {
        loadBookmarks()
    }

    return {
        bookmarks,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        loadBookmarks
    }
}
