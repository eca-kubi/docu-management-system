import {HomePage, ProfilePage, DocumentsPage, LogoutPage} from './pages';
import {withNavigationWatcher} from './contexts/navigation';

const routes = [
    {
        path: '/home',
        element: HomePage
    },
    {
        path: '/documents',
        element: DocumentsPage
    },
    {
        path: '/profile',
        element: ProfilePage
    },
    {
        path: '/logout',
        element: LogoutPage
    }
];

export default routes.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});
