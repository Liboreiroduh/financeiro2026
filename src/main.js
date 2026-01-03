import './style.css';
import { DataRepository } from './core/DataRepository.js';
import { Router } from './core/Router.js';
import { BottomNav, BottomNavStyles } from './ui/components/BottomNav.js';
import { HomePage } from './ui/pages/Home.js';
import { TransactionForm } from './ui/pages/TransactionForm.js';
import { MonthlyView } from './ui/pages/MonthlyView.js';
import { CardsView } from './ui/pages/CardsView.js';
import { Settings } from './ui/pages/Settings.js';

import { LoginPage } from './ui/pages/Login.js';
import { ProfileView } from './ui/pages/ProfileView.js';

// Inject dynamic styles (Minimal, rely on style.css)
const styleSheet = document.createElement("style");
styleSheet.innerText = BottomNavStyles;
document.head.appendChild(styleSheet);

// Define Routes
const routes = {
  '/': HomePage,
  '/login': LoginPage,
  '/profile': ProfileView,
  '/transactions': TransactionForm,
  '/monthly': MonthlyView,
  '/accounts': CardsView,
  '/more': Settings,
};

async function init() {
  try {
    console.log('Initializing Financeiro App (MD3)...');

    // Seed Data
    DataRepository.seedCategories();
    DataRepository.seedAccounts();

    const app = document.getElementById('app');
    if (!app) throw new Error("Element #app not found");

    // Setup App Shell
    // Use flex-col to allow router-outlet (app-content) to grow
    app.innerHTML = `
      <div id="app-content" class="flex-col w-full h-full" style="flex:1; overflow:hidden;"></div>
      <div id="bottom-nav-container">${BottomNav()}</div>
    `;

    // Init Router
    window.router = new Router(routes);
    window.router.init();

    // Handle Bottom Nav Active State & Visibility
    const updateNav = (path) => {
      // 1. Manage Visibility (Hide on Login)
      const navContainer = document.getElementById('bottom-nav-container');
      if (path === '/login') {
        navContainer.style.display = 'none';
      } else {
        navContainer.style.display = 'block';
      }

      // 2. Active State
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('href') === path);
      });
    };

    window.addEventListener('popstate', () => updateNav(window.location.pathname));
    document.addEventListener('route-changed', (e) => updateNav(e.detail.path));

    // Intercept links
    document.body.addEventListener('click', e => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        window.router.navigate(link.getAttribute('href'));
      }
    });

    // Expose global logout for inline handlers
    window.logout = () => {
      DataRepository.logout();
      window.location.href = '/login';
    };

    // Set initial active state
    updateNav(window.location.pathname);

  } catch (error) {
    console.error("CRITICAL INIT ERROR:", error);
    document.body.innerHTML = `<div style="padding:20px;"><h1>Erro</h1><pre>${error.message}</pre></div>`;
  }
}

init();
