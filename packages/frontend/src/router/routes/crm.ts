const crmRoutes = [
  {
    path: '/',
    name: 'DefaultLayout',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/components/crm/home/HomePage.vue'),
        meta: {
          title: 'Home',
        },
      },
      {
        path: '/projects/:projectId',
        name: 'ProjectHome',
        component: () => import('@/components/common/projects/ProjectHome.vue'),
        meta: {
          requiresAuth: true,
          title: 'Project Details',
        },
      },
      {
        path: '/projects/:projectId/contacts',
        name: 'Contacts',
        component: () => import('@/components/crm/contacts/ContactsTable.vue'),
        meta: {
          requiresAuth: true,
          title: 'Contacts',
        },
      },
      {
        path: '/projects/:projectId/contacts/:contactId',
        name: 'ViewContact',
        component: () => import('@/components/crm/contacts/ViewContactPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Contact Details',
        },
      },
      {
        path: '/projects/:projectId/organizations',
        name: 'Organizations',
        component: () => import('@/components/crm/organizations/OrganizationsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Organizations',
        },
      },
      {
        path: '/projects/:projectId/deals',
        name: 'Deals',
        component: () => import('@/components/crm/deals/DealsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Deals',
        },
      },
      {
        path: '/projects/:projectId/tasks',
        name: 'Tasks',
        component: () => import('@/components/crm/tasks/TasksView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Tasks',
        },
      },
    ]
  },
];

export default crmRoutes;
