const projectManagementRoutes = [
  {
    path: '/pm',
    name: 'ProjectLayout',
    component: () => import('@/layouts/ProjectLayout.vue'),
    children: [
      {
        path: '/pm',
        name: 'PMHome',
        component: () => import('@/components/project-management/PMHome.vue'),
        meta: {
          title: 'Project Management',
        },
      },
      {
        path: '/workspaces/:workspaceId/spaces/:spaceId',
        name: 'SpacePage',
        component: () =>
          import('@/components/project-management/spaces/SpacePage.vue'),
        meta: {
          title: 'Space',
        },
      },
      {
        path: '/workspaces/:workspaceId/spaces/:spaceId/lists/:listId',
        name: 'ListPage',
        component: () =>
          import('@/components/project-management/lists/ListPage.vue'),
        meta: {
          title: 'List',
        },
        children: [
          {
            path: '/workspaces/:workspaceId/spaces/:spaceId/lists/:listId/views/:viewId',
            name: 'ListView',
            component: () =>
              import('@/components/project-management/views/ListView.vue'),
            meta: {
              title: 'View',
            },
          },
        ],
      },
      {
        path: '/workspaces/:workspaceId/cards/:cardId',
        name: 'CardPage',
        component: () =>
          import('@/components/project-management/cards/CardPage.vue'),
        meta: {
          title: 'Card',
        },
      },
    ],
  },
];

export default projectManagementRoutes;
