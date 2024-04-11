const routes = [
  {
    path: '/',
    name: 'DefaultLayout',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: 'Home',
        },
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: {
          title: 'About',
        },
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: {
          requiresAuth: false,
          title: 'Users',
        },
      },
      {
        path: '/projects',
        name: 'Projects',
        component: () => import('@/views/Projects.vue'),
        meta: {
          requiresAuth: true,
          title: 'Projects',
        },
      },
      {
        path: '/projects/:projectId',
        name: 'ProjectHome',
        component: () => import('@/views/ProjectHomeView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Project Details',
        },
      },
      {
        path: '/projects/:projectId/contacts',
        name: 'Contacts',
        component: () => import('@/components/contacts/ContactsTable.vue'),
        meta: {
          requiresAuth: true,
          title: 'Contacts',
        },
      },
      {
        path: '/projects/:projectId/contacts/:contactId',
        name: 'ViewContact',
        component: () => import('@/components/contacts/ViewContactPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Contact Details',
        },
      },
      {
        path: '/projects/:projectId/organizations',
        name: 'Organizations',
        component: () => import('@/components/organizations/OrganizationsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Organizations',
        },
      },
      {
        path: '/projects/:projectId/deals',
        name: 'Deals',
        component: () => import('@/components/deals/DealsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Deals',
        },
      },
      {
        path: '/projects/:projectId/tasks',
        name: 'Tasks',
        component: () => import('@/components/tasks/TasksView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Tasks',
        },
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/auth/LoginPage.vue'),
    meta: {
      requiresGuest: true,
      title: 'Login',
    },
  },
];

export default routes;
