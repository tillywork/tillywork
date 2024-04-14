const projectManagementRoutes = [
	{
		path: '/pm',
		name: 'ProjectLayout',
		component: () => import('@/layouts/ProjectLayout.vue'),
		children: [
			{
				path: '/pm',
				name: 'PMHome',
				component: () => import('@/modules/project-management/PMHome.vue'),
				meta: {
					title: 'Project Management',
				},
			},
			{
				path: '/workspaces/:workspaceId/spaces/:spaceId',
				name: 'SpacePage',
				component: () => import('@/modules/project-management/spaces/SpacePage.vue'),
				meta: {
					title: 'Space',
				},
			},
			{
				path: '/workspaces/:workspaceId/spaces/:spaceId/lists/:listId',
				name: 'ListPage',
				component: () => import('@/modules/project-management/lists/ListPage.vue'),
				meta: {
					title: 'List',
				},
			},
		]
	},
];

export default projectManagementRoutes;
