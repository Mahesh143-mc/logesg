import { Sidebar, BottomNav } from './Navigation';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import { Menu, Leaf } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate } from 'react-router-dom';

// Page Imports
import { Dashboard } from '../pages/Dashboard';
import { Billing } from '../pages/Billing';
import { Products } from '../pages/Products';
import { Inventory } from '../pages/Inventory';
import { Customers } from '../pages/Customers';
import { Expenses } from '../pages/Expenses';
import { SalesHistory } from '../pages/SalesHistory';
import { Orders } from '../pages/Orders';
import { OrderHistory } from '../pages/OrderHistory';
import { Reports } from '../pages/Reports';
import { Notes } from '../pages/Notes';
import { Settings } from '../pages/Settings';
import { PendingAmount } from '../pages/PendingAmount';

export function Layout() {
  const { user, currentAdminPage } = useStore();
  const { loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentAdminPage) {
      case 'dashboard': return <Dashboard />;
      case 'billing': return <Billing />;
      case 'products': return <Products />;
      case 'inventory': return <Inventory />;
      case 'customers': return <Customers />;
      case 'expenses': return <Expenses />;
      case 'sales-history': return <SalesHistory />;
      case 'orders': return <Orders />;
      case 'order-history': return <OrderHistory />;
      case 'reports': return <Reports />;
      case 'notes': return <Notes />;
      case 'settings': return <Settings />;
      case 'pending-amount': return <PendingAmount />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950 transition-colors">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#fbfbfb] dark:bg-[#09090b] overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[50] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-[#09090b] z-[60] shadow-2xl md:hidden"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-32 md:pb-0 relative custom-scrollbar">
        <div className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800 px-4 h-16 flex items-center justify-between transition-colors">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-slate-100/80 dark:bg-zinc-800/80 text-slate-900 dark:text-white rounded-xl active:scale-95 transition-all hover:bg-slate-200 dark:hover:bg-zinc-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Vivasayi</span>
          </div>
          <div className="w-8" />
        </div>
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAdminPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
