import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Simple path-based routing without react-router-dom
// /         → Dashboard (App)
// /members  → MembersPage

const path = window.location.pathname;

async function renderApp() {
  let Component: React.ComponentType;

  if (path.startsWith('/members')) {
    const { default: MembersPage } = await import('./pages/MembersPage');
    Component = MembersPage;
  } else {
    const { default: App } = await import('./App');
    Component = App;
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </StrictMode>
  );
}

renderApp();
