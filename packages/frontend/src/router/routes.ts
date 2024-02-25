const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import('@/views/Home.vue'),
	},
	{
		path: '/about',
		name: 'About',
		component: () => import('@/views/About.vue'),
	},
	{
		path: '/users',
		name: 'Users',
		component: () => import('@/views/Users.vue'),
		meta: {
			requiresAuth: false,
		},
	},
	{
		path: '/projects',
		name: 'Projects',
		component: () => import('@/views/Projects.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/projects/:projectId',
		name: 'ProjectHome',
		component: () => import('@/views/ProjectHomeView.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/projects/:projectId/contacts',
		name: 'Contacts',
		component: () => import('@/modules/contacts/ContactsTable.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/projects/:projectId/contacts/:contactId',
		name: 'ViewContact',
		component: () => import('@/modules/contacts/ViewContactPage.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/modules/auth/LoginPage.vue'),
		meta: {
			requiresGuest: true,
		},
	},
];

export default routes;