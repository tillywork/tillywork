const commonRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/common/auth/LoginPage.vue'),
    meta: {
      requiresGuest: true,
      title: 'Login',
    },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/common/HomePage.vue'),
    meta: {
        title: 'Home'
    }
  }
];

export default commonRoutes;
