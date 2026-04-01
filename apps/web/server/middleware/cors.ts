export default defineEventHandler((event) => {
    // Set headers to allow Firebase Auth popup/redirect to work properly
    // These headers prevent COOP from blocking the auth popup
    setResponseHeaders(event, {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'unsafe-none'
    })
})
