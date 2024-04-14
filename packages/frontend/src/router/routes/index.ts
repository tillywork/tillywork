import commonRoutes from "./common";
import crmRoutes from "./crm";
import projectManagementRoutes from "./project-management";

const routes = [
	...commonRoutes,
	...crmRoutes,
	...projectManagementRoutes,
];

export default routes;