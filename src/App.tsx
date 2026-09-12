import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Invitation from './pages/Invitation';

type Page = 'invitation' | 'admin-login' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('invitation');
  const isAuthenticated = useStore(s => s.isAuthenticated);

  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user');
      const toParam = params.get('to');
      const previewParam = params.get('preview');

      // If ?user=username&preview=true → show invitation preview (no auto-login)
      if (userParam && previewParam === 'true') {
        setCurrentPage('invitation');
        return;
      }

      // If ?user=username is in URL → show invitation page with that user's data
      if (userParam && !hash) {
        // Just show the invitation page - it will handle the user parameter
        setCurrentPage('invitation');
        return;
      }

      // Admin routes
      if (hash === '#/admin') {
        if (isAuthenticated) {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('admin-login');
        }
      } else {
        // Show invitation page (with or without ?user and ?to params)
        setCurrentPage('invitation');
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, [isAuthenticated]);

  const handleLogin = () => {
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    useStore.getState().logout();
    window.location.hash = '';
    // Remove user parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('user');
    window.history.replaceState({}, '', url.toString());
    setCurrentPage('invitation');
  };

  switch (currentPage) {
    case 'admin-login':
      return <AdminLogin onLogin={handleLogin} />;
    case 'dashboard':
      return <Dashboard onLogout={handleLogout} />;
    default:
      return <Invitation />;
  }
}

export default App;
