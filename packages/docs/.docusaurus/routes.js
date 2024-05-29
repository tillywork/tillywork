import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', '83f'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '27e'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'a8d'),
            routes: [
              {
                path: '/category/contribution',
                component: ComponentCreator('/category/contribution', 'b57'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/category/frontend',
                component: ComponentCreator('/category/frontend', '246'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/category/getting-started',
                component: ComponentCreator('/category/getting-started', 'a98'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/contribution/frontend/data',
                component: ComponentCreator('/contribution/frontend/data', '43c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/contribution/frontend/devtools',
                component: ComponentCreator('/contribution/frontend/devtools', '560'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/contribution/frontend/routing',
                component: ComponentCreator('/contribution/frontend/routing', '5a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/contribution/frontend/vuetify',
                component: ComponentCreator('/contribution/frontend/vuetify', 'bd9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/contribution/overview',
                component: ComponentCreator('/contribution/overview', 'a9b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', '19f'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
