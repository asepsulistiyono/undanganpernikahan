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
      if (hash === '#/admin') {
        if (isAuthenticated) {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('admin-login');
        }
      } else {
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
