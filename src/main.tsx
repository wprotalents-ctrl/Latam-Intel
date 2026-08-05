import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Simple path-based routing without react-router-dom.
// /          → Dashboard (App)
// /members   → Archived (MembersPage is saved in src/_archive/ for
//               post-funding; for now, redirect back to /)

const path = window.location.pathname;

async function renderApp() {
  // Redirect /members to root — MembersPage is archived
  if (path.startsWith('/members')) {
    window.location.replace(window.location.origin + '/');
    return;
  }

  const { default: App } = await import('./App');

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

renderApp();
