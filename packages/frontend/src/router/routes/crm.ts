const crmRoutes = [
  {
    path: '/crm',
    name: 'DefaultLayout',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [

    ]
  },
];

export default crmRoutes;
