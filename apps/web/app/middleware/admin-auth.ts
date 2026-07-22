import { authClient } from "../../utils/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const { data: session } = await authClient.getSession();
  if (!session?.user) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  const adminEmails = String(useRuntimeConfig().public.adminEmails ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath, unauthorized: "1" },
    });
  }
});
