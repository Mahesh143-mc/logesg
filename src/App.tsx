import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';

// Lazy load components
const Layout = lazy(() => import('./components/Layout').then(m => ({ default: m.Layout })));
const CustomerLayout = lazy(() => import('./components/customer/CustomerLayout').then(m => ({ default: m.CustomerLayout })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ScrollToTop = lazy(() => import('./components/ScrollToTop').then(m => ({ default: m.ScrollToTop })));

const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950 transition-colors">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
  </div>
);

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950 transition-colors">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950 transition-colors">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}

function RootSelector() {
  const { portal, urlMode } = useStore();
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (urlMode === 'static') {
    return <Navigate to="/logesh-vivasayi" replace />;
  }

  return portal === 'admin' ? <AdminRoute><Layout /></AdminRoute> : <PublicRoute><CustomerLayout /></PublicRoute>;
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
      <Toaster position="top-center" />
      <Suspense fallback={<LoadingSpinner />}>
        <ScrollToTop />
        <Routes>
          {/* Dynamic Root Route */}
          <Route path="/" element={<RootSelector />} />

          {/* Static Routing Prefixed Routes */}
          <Route path="/logesh-vivasayi/admin" element={<AdminRoute><Layout /></AdminRoute>} />
          <Route path="/logesh-vivasayi/admin/:pageId" element={<AdminRoute><Layout /></AdminRoute>} />
          <Route path="/logesh-vivasayi" element={<PublicRoute><CustomerLayout /></PublicRoute>} />
          <Route path="/logesh-vivasayi/:pageId" element={<PublicRoute><CustomerLayout /></PublicRoute>} />
          
          {/* Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
