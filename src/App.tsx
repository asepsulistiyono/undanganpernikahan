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
  const isLoading = useStore(s => s.isLoading);
  const initializeFirebase = useStore(s => s.initializeFirebase);

  // Initialize Firebase on app start
  useEffect(() => {
    initializeFirebase().catch(err => {
      console.error('Failed to initialize Firebase:', err);
    });
  }, []);

  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user');
      const toParam = params.get('to');
      const previewParam = params.get('preview');

      console.log('Route check:', { hash, userParam, toParam, previewParam });

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
          store.login(user.username, user.password).then((loginSuccess) => {
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
          });
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
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
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

  // Show loading screen while Firebase is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

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
