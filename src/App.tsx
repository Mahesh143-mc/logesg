import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { Login } from './pages/Login';
import { ScrollToTop } from './components/ScrollToTop';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';

function MainEntry() {
  const { user } = useStore();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950 transition-colors">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // If user is logged in, show Admin Layout at the root
  // If not, show Customer Layout at the root
  return user ? <Layout /> : <CustomerLayout />;
}

export default function App() {
  const { theme } = useStore();
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Single entry point for both Customer and Admin portals */}
        <Route path="/" element={<MainEntry />} />
        
        {/* Auth Route remains for login access */}
        <Route path="/login" element={<Login />} />

        {/* Redirect everything else to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
