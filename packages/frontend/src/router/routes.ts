const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import('../views/Home.vue'),
	},
	{
		path: '/about',
		name: 'About',
		component: () => import('../views/About.vue'),
	},
	{
		path: '/users',
		name: 'Users',
		component: () => import('../views/Users.vue'),
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
		component: () => import('../views/ProjectHomeView.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/projects/:projectId/contacts',
		name: 'Contacts',
		component: () => import('../views/Contacts.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/projects/:projectId/contacts/:contactId',
		name: 'ViewContact',
		component: () => import('../views/ViewContact.vue'),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: '/login',
		name: 'Login',
		component: () => import('../views/Login.vue'),
		meta: {
			requiresGuest: true,
		},
	},
];

export default routes;