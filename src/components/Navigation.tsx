import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ShoppingBag,
  Users, 
  BarChart3, 
  Settings, 
  ClipboardList, 
  IndianRupee, 
  History as HistoryIcon, 
  Notebook,
  Leaf,
  X,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  LogOut,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD', id: 'dashboard' },
  { icon: Package, label: 'PRODUCTS', id: 'products' },
  { icon: ShoppingCart, label: 'BILLING', id: 'billing' },
  { icon: ShoppingBag, label: 'ORDERS', id: 'orders', showBadge: true },
  { icon: HistoryIcon, label: 'HISTORY', id: 'sales-history' },
  { icon: IndianRupee, label: 'PENDING DUES', id: 'pending-amount', showPendingBadge: true },
  { icon: IndianRupee, label: 'EXPENSES', id: 'expenses' },
  { icon: Users, label: 'CUSTOMERS', id: 'customers' },
  { icon: ClipboardList, label: 'INVENTORY', id: 'inventory' },
  { icon: Notebook, label: 'BRIEF', id: 'notes' },
  { icon: BarChart3, label: 'INTELLIGENCE', id: 'reports' },
  { icon: Settings, label: 'SYSTEM CORE', id: 'settings' },
];

export function BottomNav() {
    const { currentAdminPage, setCurrentAdminPage, urlMode } = useStore();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingAmountCount, setPendingAmountCount] = useState(0);

  const handleNavClick = (id: string) => {
    if (urlMode === 'static') {
      navigate(`/logesh-vivasayi/admin/${id}`);
    } else {
      setCurrentAdminPage(id);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'sales'),
      where('type', '==', 'online_order')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pending = snapshot.docs.filter(doc => doc.data().status === 'pending');
      setPendingCount(pending.length);
    });

    const qPending = query(
      collection(db, 'customers'),
      where('pendingPayment', '>', 0)
    );
    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      setPendingAmountCount(snapshot.docs.length);
    });

    return () => {
      unsubscribe();
      unsubscribePending();
    };
  }, []);

  const mobileNavItems = [...navItems.slice(0, 4), navItems.find(item => item.id === 'pending-amount')].filter(Boolean);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
      <nav className="flex h-16 items-center justify-around bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:bg-[#18181b]/90 dark:border-zinc-800 dark:shadow-none transition-colors">
        {mobileNavItems.map((item: any) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all active:scale-90",
              currentAdminPage === item.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            )}
          >
            <div className="relative">
              <item.icon className={cn(
                "transition-all duration-300",
                currentAdminPage === item.id ? "h-6 w-6 stroke-[2.5px] -translate-y-0.5" : "h-5 w-5 stroke-[2px]"
              )} />
              {item.showBadge && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-white shadow-lg">
                  {pendingCount}
                </span>
              )}
              {item.showPendingBadge && pendingAmountCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white shadow-lg">
                  {pendingAmountCount}
                </span>
              )}
            </div>
            {currentAdminPage === item.id && (
              <span className="text-[9px] font-bold tracking-wide animate-in fade-in zoom-in duration-300">{item.label.split(' ')[0]}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar({ onClose, isMobile }: { onClose?: () => void; isMobile?: boolean }) {
  const { currentAdminPage, setCurrentAdminPage, theme, setTheme, urlMode, setPortal } = useStore();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingAmountCount, setPendingAmountCount] = useState(0);

  const handleNavClick = (id: string) => {
    if (urlMode === 'static') {
      navigate(`/logesh-vivasayi/admin/${id}`);
    } else {
      setCurrentAdminPage(id);
    }
    onClose?.();
  };

  useEffect(() => {
    const q = query(
      collection(db, 'sales'),
      where('type', '==', 'online_order')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pending = snapshot.docs.filter(doc => doc.data().status === 'pending');
      setPendingCount(pending.length);
    });

    const qPending = query(
      collection(db, 'customers'),
      where('pendingPayment', '>', 0)
    );
    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      setPendingAmountCount(snapshot.docs.length);
    });

    return () => {
      unsubscribe();
      unsubscribePending();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      await signOut(auth);
      onClose?.();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className={cn(
      "flex flex-col h-full bg-white border-r border-slate-200/60 transition-all duration-300 shadow-sm dark:bg-[#09090b] dark:border-zinc-800",
      isMobile ? "w-full" : "hidden w-72 md:flex"
    )}>
      <div className="p-6 border-b border-slate-100/60 dark:border-zinc-800">
        <div className="flex items-center space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none dark:text-white">Vivasayi</h1>
            <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 tracking-wide mt-1">Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={cn(
              "flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all group relative",
              currentAdminPage === item.id
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
            )}
          >
            {currentAdminPage === item.id && (
              <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full" />
            )}
            <item.icon className={cn(
              "h-5 w-5 transition-transform",
              currentAdminPage === item.id ? "text-indigo-600 dark:text-indigo-400 stroke-[2.5px]" : "text-slate-400 group-hover:text-slate-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 stroke-[2px]"
            )} />
            <span className="flex-1 text-left tracking-tight">{item.label}</span>
            {item.showBadge && pendingCount > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-orange-500 text-[10px] font-black text-white shadow-lg shadow-orange-100 dark:shadow-none">
                {pendingCount}
              </span>
            )}
            {item.showPendingBadge && pendingAmountCount > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-red-500 text-[10px] font-black text-white shadow-lg shadow-red-100 dark:shadow-none">
                {pendingAmountCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100/60 dark:border-zinc-800 space-y-2">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex w-full items-center justify-between px-4 py-3 rounded-xl bg-slate-50 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/80 transition-all dark:bg-[#18181b] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 active:scale-95"
        >
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-xs font-semibold tracking-wide">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={cn(
            "w-8 h-4 rounded-full relative transition-all",
            theme === 'dark' ? "bg-indigo-500" : "bg-slate-300"
          )}>
            <div className={cn(
              "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
              theme === 'dark' ? "left-4.5" : "left-0.5"
            )} />
          </div>
        </button>

        <button 
          onClick={() => {
            setPortal('customer');
            navigate(urlMode === 'static' ? '/logesh-vivasayi/home' : '/');
          }}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-none active:scale-95"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wide">Visit Online Store</span>
        </button>

        <button 
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group active:scale-95 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-semibold tracking-wide">{isMobile ? 'Logout' : 'Log Out'}</span>
        </button>
      </div>
    </aside>
  );
}
