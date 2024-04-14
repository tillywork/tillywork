import { createRouter, createWebHistory } from 'vue-router';
import { requireAuthGuard, requireGuestGuard, titleGuard } from './guards';
import routes from './routes'

// Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.FD_BASE_URL), // Using HTML5 history mode
  routes,
});

router.beforeEach(requireAuthGuard);
router.beforeEach(requireGuestGuard);
router.beforeEach(titleGuard);

export default router;
