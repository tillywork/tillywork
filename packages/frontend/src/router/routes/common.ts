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
    path: '/projects',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/projects',
        name: 'Projects',
        component: () => import('@/components/common/projects/ProjectsTable.vue'),
        meta: {
          requiresAuth: true,
          title: 'Projects',
        },
      }
    ]
  }
];

export default commonRoutes;
