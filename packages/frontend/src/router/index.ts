import {
  createRouter,
  createWebHistory,
} from 'vue-router';
import { requireAuthGuard, requireGuestGuard } from './guards';

// Define your routes here
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Projects.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects/:projectId',
    name: 'ProjectHome',
    component: () => import('../views/ProjectHomeView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projects/:projectId/contacts',
    name: 'Contacts',
    component: () => import('../views/Contacts.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      requiresGuest: true,
    },
  },
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.FD_BASE_URL), // Using HTML5 history mode
  routes,
});

router.beforeEach(requireAuthGuard);
router.beforeEach(requireGuestGuard);

export default router;
