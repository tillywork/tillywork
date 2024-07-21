import { createRouter, createWebHistory } from 'vue-router/auto';
import { requireAuthGuard, requireGuestGuard } from './guards';
import { collectActivities } from './activities';

// Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.TW_BASE_URL), // Using HTML5 history mode
  scrollBehavior() {
    // always scroll to top
    return { top: 0 };
  },
});

router.beforeEach(requireAuthGuard);
router.beforeEach(requireGuestGuard);
router.beforeEach(collectActivities);

export default router;
