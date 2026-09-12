import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Invitation from './pages/Invitation';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

type Page = 'invitation' | 'admin-login' | 'dashboard' | 'super-admin';

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

      // If ?user=username&to=name → show invitation with guest name
      if (userParam && toParam) {
        setCurrentPage('invitation');
        return;
      }

      // If ?user=username (without &to and without &preview) → auto-login & go to dashboard
      if (userParam && !previewParam && !toParam) {
        const store = useStore.getState();
        console.log('All users in store:', store.users);
        const user = store.users.find(u => u.username === userParam);
        console.log('Found user:', user);
        
        if (user && user.isActive) {
          // Auto-login this user
          const loginSuccess = store.login(user.username, user.password);
          console.log('Login success:', loginSuccess);
          // Clean URL completely
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          // Navigate based on role
          if (user.role === 'super-admin') {
            window.location.hash = '#/super-admin';
            setCurrentPage('super-admin');
          } else {
            window.location.hash = '#/admin';
            setCurrentPage('dashboard');
          }
          return;
        } else if (user && !user.isActive) {
          // User exists but inactive
          alert(`User "${userParam}" tidak aktif. Hubungi administrator.`);
          setCurrentPage('invitation');
          return;
        } else {
          // User not found
          alert(`User "${userParam}" tidak ditemukan. Silakan buat user terlebih dahulu di Super Admin Dashboard.`);
          setCurrentPage('invitation');
          return;
        }
      }

      // Super Admin routes
      if (hash === '#/super-admin') {
        const store = useStore.getState();
        if (isAuthenticated && store.currentUser?.role === 'super-admin') {
          setCurrentPage('super-admin');
        } else {
          setCurrentPage('admin-login');
        }
      }
      // Admin routes
      else if (hash === '#/admin') {
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
    const store = useStore.getState();
    if (store.currentUser?.role === 'super-admin') {
      window.location.hash = '#/super-admin';
      setCurrentPage('super-admin');
    } else {
      window.location.hash = '#/admin';
      setCurrentPage('dashboard');
    }
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
    case 'super-admin':
      return <SuperAdminDashboard onLogout={handleLogout} />;
    default:
      return <Invitation />;
  }
}

export default App;
