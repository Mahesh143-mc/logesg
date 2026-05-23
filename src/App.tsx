import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import { m, AnimatePresence, LazyMotion, domAnimation } from 'motion/react';
import Lenis from 'lenis';

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

const PreloaderScreen = () => {
  return (
    <m.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#012217] via-[#053724] to-[#01140e] text-white"
    >
      <div className="text-center px-4">
        {/* Glowing Logo Circle */}
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-28 h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center p-2 shadow-lg shadow-emerald-900/30 border border-emerald-500/20 mb-8"
        >
          <img 
            src="https://res.cloudinary.com/dyaufjpai/image/upload/q_auto,f_auto,w_200/v1779255158/Logo_final_-_2_unomy8.png" 
            alt="Logesh Vivasayi Logo" 
            className="w-full h-full object-contain"
          />
        </m.div>

        {/* Brand Name with Tamil & English */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
            லோகேஷ் விவசாயி
          </h1>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.25em]">
            Logesh Vivasayi
          </p>
        </m.div>

        {/* Quality Badging */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-6 inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold text-emerald-300 uppercase tracking-wider"
        >
          <span>100% தரம்</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>100% இயற்கை</span>
        </m.div>

        {/* Animated Loading Bar */}
        <div className="w-48 h-1 bg-emerald-950/60 rounded-full overflow-hidden mx-auto mt-8 border border-emerald-500/5">
          <m.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-emerald-400 to-lime-400"
          />
        </div>

        {/* Small Status Text */}
        <p className="text-[10px] font-bold text-emerald-300/40 uppercase tracking-widest mt-3 animate-pulse">
          Loading Freshness...
        </p>
      </div>
    </m.div>
  );
};

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
  const [minTimePassed, setMinTimePassed] = useState(false);
  const { loading } = useAuth();

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const showSplash = !minTimePassed || loading;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {showSplash && <PreloaderScreen />}
      </AnimatePresence>
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
    </LazyMotion>
  );
}
