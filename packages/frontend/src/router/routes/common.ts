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
];

export default commonRoutes;
