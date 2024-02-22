import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import { useAuth } from "@/composables/useAuth";

export const requireGuestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isAuthenticated } = useAuth(); // Get the isAuthenticated method from the composable

  if (
    to.matched.some((record) => record.meta.requiresGuest) &&
    isAuthenticated()
  ) {
    // If the route requires no authentication and the user is authenticated
    next({ name: 'Home' }); // Redirect to home page
  } else {
    // Otherwise, proceed as normal
    next();
  }
}

export const requireAuthGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isAuthenticated } = useAuth(); // Get the isAuthenticated method from the composable

  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isAuthenticated()
  ) {
    // If the route requires authentication and the user is not authenticated
    next({ name: 'Login' }); // Redirect to the login page
  } else {
    // Otherwise, proceed as normal
    next();
  }
}