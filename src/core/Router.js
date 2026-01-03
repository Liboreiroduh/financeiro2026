import { StorageManager } from './StorageManager.js';

export class Router {
    constructor(routes, rootElementId = 'app-content') {
        this.routes = routes;
        this.rootElement = document.getElementById(rootElementId);
        this.currentRoute = null;
        this.currentRouteKey = null; // Track full path + query

        // Bind navigation events
        window.addEventListener('popstate', () => this.handleRoute());
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    refresh() {
        this.currentRouteKey = null;
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname;

        // AUTH GUARD
        // We import DataRepository dynamically or assume it's globally available? 
        // Better to pass it or import it. Since this is a simple app, we can import it.
        // NOTE: Need to verify if 'DataRepository' is imported. If not, we might need a dynamic import or fix imports.
        // Assuming DataRepository is imported at top of file.

        // Circular dependency risk if DataRepository imports Router? No, DataRepo is standalone.
        // Let's rely on a callback or global check if we don't want to import here.
        // But importing is cleaner.

        // CHECK SESSION (Check against DataRepository logic)
        // Hardcoded check: If path is NOT /login and no session, go login.
        // We need to read session directly from StorageManager if DataRepo isn't imported,
        // OR we add the import. I'll add the import in a separate tool call if needed, 
        // but let's assume I can add it now.

        const session = StorageManager.get('fin_session', null);

        const isLogin = path === '/login';

        if (!session && !isLogin) {
            window.history.replaceState({}, '', '/login');
            return this.handleRoute(); // Recursion to load login
        }

        if (session && isLogin) {
            window.history.replaceState({}, '', '/');
            return this.handleRoute();
        }

        const route = this.routes[path] || this.routes['/'];
        const fullKey = path + window.location.search;

        if (this.currentRoute === route && this.currentRouteKey === fullKey) return;

        this.currentRoute = route;
        this.currentRouteKey = fullKey;
        this.rootElement.innerHTML = route.render();
        if (route.afterRender) route.afterRender();

        // Update active state in navigation
        document.dispatchEvent(new CustomEvent('route-changed', { detail: { path } }));
    }

    init() {
        this.handleRoute();
    }
}
