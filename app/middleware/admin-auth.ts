export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { user, isAdmin, init } = useFirebaseAuth()
  await init()

  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }

  if (!isAdmin.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
        unauthorized: '1'
      }
    })
  }
})
