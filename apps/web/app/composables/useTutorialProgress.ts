interface TutorialProgress {
    [series: string]: string[]
}

const PROGRESS_KEY = 'learn:progress'

export const useTutorialProgress = (series: string) => {
    const progress = useState<TutorialProgress>('tutorial-progress', () => ({}))

    const loadProgress = (): void => {
        if (import.meta.server) return
        try {
            const stored = localStorage.getItem(PROGRESS_KEY)
            progress.value = stored ? JSON.parse(stored) : {}
        } catch {
            progress.value = {}
        }
    }

    const saveProgress = (): void => {
        if (import.meta.server) return
        try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value))
        } catch {
            // Ignore storage errors
        }
    }

    const completed = computed<string[]>(() => progress.value[series] || [])

    const isComplete = (step: string): boolean => {
        return completed.value.includes(step)
    }

    const toggle = (step: string): boolean => {
        if (import.meta.server) return false

        const current = progress.value[series] ? [...progress.value[series]] : []
        const index = current.indexOf(step)

        if (index >= 0) {
            current.splice(index, 1)
        } else {
            current.push(step)
        }

        progress.value = { ...progress.value, [series]: current }
        saveProgress()
        return index < 0
    }

    const setComplete = (step: string, value: boolean): void => {
        if (import.meta.server) return
        if (isComplete(step) === value) return
        toggle(step)
    }

    const seriesProgress = (totalSteps: number) => {
        return computed(() => {
            if (totalSteps <= 0) return 0
            return Math.round((completed.value.length / totalSteps) * 100)
        })
    }

    // Initialize on client
    if (!import.meta.server) {
        loadProgress()
    }

    return {
        completed,
        isComplete,
        toggle,
        setComplete,
        seriesProgress,
        loadProgress
    }
}
