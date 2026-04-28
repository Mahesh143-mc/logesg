import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Users, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Zap,
  Activity,
  Calendar,
  Wallet,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { setCurrentAdminPage, theme } = useStore();
  const [stats, setStats] = useState({
    todaySales: 0,
    monthlySales: 0,
    totalProducts: 0,
    lowStock: 0,
    pendingPayments: 0,
    totalCustomers: 0,
    monthlyExpenses: 0
  });

  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    // Real-time stats
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data());
      setStats(prev => ({
        ...prev,
        totalProducts: products.length,
        lowStock: products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length
      }));
    });

    const unsubscribeExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const thisMonth = new Date().getMonth();
      const expenses = snapshot.docs.map(doc => doc.data());
      const monthTotal = expenses
        .filter(e => {
          const date = e.date?.toDate ? e.date.toDate() : new Date(e.date);
          return date.getMonth() === thisMonth;
        })
        .reduce((acc, e) => acc + e.amount, 0);
      
      setStats(prev => ({
        ...prev,
        monthlyExpenses: monthTotal
      }));
    });

    const unsubscribeSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const sales = snapshot.docs.map(doc => doc.data());
      const today = new Date().setHours(0,0,0,0);
      const thisMonth = new Date().getMonth();
      
      const todayTotal = sales
        .filter(s => {
          const date = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
          return date.setHours(0,0,0,0) === today;
        })
        .reduce((acc, s) => acc + s.total, 0);
        
      const monthTotal = sales
        .filter(s => {
          const date = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
          return date.getMonth() === thisMonth;
        })
        .reduce((acc, s) => acc + s.total, 0);

      setStats(prev => ({
        ...prev,
        todaySales: todayTotal,
        monthlySales: monthTotal
      }));

      // Top Products
      const productCounts: any = {};
      sales.forEach(sale => {
        sale.items?.forEach((item: any) => {
          productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
        });
      });
      const sortedProducts = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);
      setTopProducts(sortedProducts);

      // Chart data (last 7 days)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.setHours(0,0,0,0);
      }).reverse();

      const chartData = last7Days.map(day => {
        const dayTotal = sales
          .filter(s => {
            const date = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
            return date.setHours(0,0,0,0) === day;
          })
          .reduce((acc, s) => acc + s.total, 0);
        return dayTotal;
      });

      setSalesHistory(chartData);
    });

    const unsubscribeCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setStats(prev => ({
        ...prev,
        totalCustomers: snapshot.size
      }));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSales();
      unsubscribeCustomers();
      unsubscribeExpenses();
    };
  }, []);

  const chartData = [
    { name: '6d ago', value: salesHistory[0] || 0 },
    { name: '5d ago', value: salesHistory[1] || 0 },
    { name: '4d ago', value: salesHistory[2] || 0 },
    { name: '3d ago', value: salesHistory[3] || 0 },
    { name: '2d ago', value: salesHistory[4] || 0 },
    { name: 'Yesterday', value: salesHistory[5] || 0 },
    { name: 'Today', value: salesHistory[6] || 0 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl p-4 shadow-xl border border-slate-200/50 rounded-2xl dark:bg-[#18181b]/90 dark:border-zinc-800">
          <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-zinc-400 mb-1">{label}</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const handleQuickAction = (page: string) => {
    setCurrentAdminPage(page);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <header className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-between md:space-y-0">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Telemetry</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-none dark:text-white">Control Center</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 tracking-wide mt-1">Global operations overview [node_01]</p>
        </div>
        <div className="flex items-center space-x-8">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className="text-xs font-black text-emerald-600 uppercase">Authenticated</span>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
           </div>
           <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20 group hover:rotate-6 transition-transform">
              <Zap className="w-8 h-8 text-white" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Daily Revenue" 
          value={`₹${stats.todaySales.toLocaleString()}`} 
          icon={TrendingUp} 
          color="indigo"
          trend="+12%"
        />
        <StatCard 
          title="Yield Index" 
          value={`₹${stats.monthlySales.toLocaleString()}`} 
          icon={Wallet} 
          color="emerald"
          trend="+8%"
        />
        <StatCard 
          title="Stock Alerts" 
          value={stats.lowStock.toString()} 
          icon={AlertTriangle} 
          color="amber"
          isAlert={stats.lowStock > 0}
        />
        <StatCard 
          title="Network Node" 
          value={stats.totalCustomers.toString()} 
          icon={Users} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 admin-card !p-6 sm:!p-10 border-none shadow-premium dark:shadow-none dark:bg-[#18181b]">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Fiscal Velocity</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 tracking-wide leading-none">Revenue Growth Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-50 p-1.5 rounded-xl dark:bg-zinc-800/50 self-start sm:self-auto">
               <div className="px-4 py-2 bg-white rounded-lg text-xs font-bold text-indigo-600 shadow-sm dark:bg-zinc-700 dark:text-white">7 Days</div>
               <div className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 cursor-not-allowed">30 Days</div>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#818cf8' : '#4f46e5'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? '#818cf8' : '#4f46e5'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: theme === 'dark' ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }} 
                  dy={10}
                />
                <YAxis 
                   hide
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={theme === 'dark' ? '#818cf8' : '#4f46e5'} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8 flex flex-col h-full">
          <div className="admin-card !p-6 sm:!p-8 shadow-large flex-1 border-none dark:shadow-none bg-slate-900 dark:bg-[#18181b] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <h3 className="relative z-10 text-lg sm:text-xl font-bold tracking-tight mb-6">Resource Velocity</h3>
            <div className="relative z-10 space-y-6">
              {topProducts.length === 0 ? (
                <div className="py-20 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">Awaiting Data Feed</div>
              ) : (
                topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center space-x-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl text-[10px] font-black bg-slate-800 text-indigo-400 border border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        0{i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium tracking-wide mt-0.5">High Momentum</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-bold text-indigo-400 group-hover:text-white transition-colors">{p.count}</p>
                       <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-500 tracking-wide leading-none">Units</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => setCurrentAdminPage('inventory')}
              className="mt-8 w-full py-3 sm:py-4 border border-slate-700/50 rounded-xl text-[11px] font-bold tracking-wide text-slate-300 hover:bg-white/5 hover:text-white transition-all active:scale-95"
            >
              Examine Inventory Registry
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <QuickActionButton 
           label="Open Terminal" 
           sub="POS Management" 
           icon={ShoppingCart} 
           onClick={() => handleQuickAction('billing')} 
           color="indigo"
        />
        <QuickActionButton 
           label="Resource Deck" 
           sub="Inventory Analytics" 
           icon={Package} 
           onClick={() => handleQuickAction('inventory')} 
           color="emerald"
        />
        <QuickActionButton 
           label="Fiscal Vault" 
           sub="Revenue Reports" 
           icon={IndianRupee} 
           onClick={() => handleQuickAction('reports')} 
           color="slate"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, isAlert }: any) {
  return (
    <div className="admin-card !p-6 sm:!p-8 group hover:border-indigo-500/30 hover:shadow-lg transition-all cursor-default relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-5 pointer-events-none transition-transform group-hover:scale-110" 
           style={{ backgroundColor: color === 'indigo' ? '#4f46e5' : color === 'emerald' ? '#10b981' : '#f97316' }} />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={cn(
          "rounded-2xl p-3.5 transition-all text-white shadow-md",
          color === 'indigo' ? "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/20" : color === 'emerald' ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20" : "bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/20"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 dark:bg-emerald-500/10 dark:text-emerald-400">
             <ArrowUpRight className="w-3.5 h-3.5" />
             <span className="tracking-wide">{trend}</span>
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h4 className={cn("text-3xl sm:text-4xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white leading-none", isAlert && "text-red-500 dark:text-red-400")}>
           {value}
        </h4>
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 tracking-wide">{title}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ label, sub, icon: Icon, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between p-6 sm:p-8 admin-card hover:border-indigo-500/50 hover:shadow-lg transition-all text-left rounded-3xl"
    >
      <div className="flex items-center space-x-4 sm:space-x-6">
        <div className={cn(
          "p-4 rounded-2xl transition-all shadow-sm group-hover:scale-110",
          color === 'indigo' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" : color === 'emerald' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
        )}>
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">{label}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 tracking-wide mt-0.5">{sub}</p>
        </div>
      </div>
      <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all dark:bg-zinc-800 dark:group-hover:bg-indigo-500">
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}
