import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as LucidePieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Reports() {
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'customMonth'>('thisMonth');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailView, setDetailView] = useState<'sales' | 'expenses' | 'pending' | 'profit' | null>(null);
  const [detailSearch, setDetailSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const salesQ = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribeSales = onSnapshot(salesQ, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
      })));
    });

    const expensesQ = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsubscribeExpenses = onSnapshot(expensesQ, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: (doc.data().date as Timestamp)?.toDate() || new Date()
      })));
    });

    const unsubscribeCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      setLoading(false);
    });

    return () => {
      unsubscribeSales();
      unsubscribeExpenses();
      unsubscribeCustomers();
    };
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end = endOfDay(now);

    switch (dateRange) {
      case 'today':
        start = startOfDay(now);
        break;
      case 'yesterday':
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;
      case 'last7':
        start = startOfDay(subDays(now, 6));
        break;
      case 'last30':
        start = startOfDay(subDays(now, 29));
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'customMonth':
        const [year, month] = selectedMonth.split('-').map(Number);
        const customDate = new Date(year, month - 1, 1);
        start = startOfMonth(customDate);
        end = endOfMonth(customDate);
        break;
      default:
        start = startOfMonth(now);
    }

    const filteredSales = sales.filter(s => isWithinInterval(s.date, { start, end }));
    const filteredExpenses = expenses.filter(e => isWithinInterval(e.date, { start, end }));

    return { filteredSales, filteredExpenses, start, end };
  }, [sales, expenses, dateRange, selectedMonth]);

  const stats = useMemo(() => {
    const totalSales = filteredData.filteredSales.reduce((acc, s) => acc + s.total, 0);
    const totalExpenses = filteredData.filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    
    // Calculate accurate pending amount from real-time customer data
    const totalPending = customers.reduce((acc, curr) => acc + (curr.pendingPayment || 0), 0);
    const netProfit = totalSales - totalExpenses;

    // Daily breakdown for line chart
    const dailyData: any = {};
    const days: string[] = [];
    let current = new Date(filteredData.start);
    while (current <= filteredData.end) {
      const d = format(current, 'MMM dd');
      days.push(d);
      dailyData[d] = { date: d, sales: 0, expenses: 0 };
      current = new Date(current.setDate(current.getDate() + 1));
    }

    filteredData.filteredSales.forEach(s => {
      const d = format(s.date, 'MMM dd');
      if (dailyData[d]) dailyData[d].sales += s.total;
    });

    filteredData.filteredExpenses.forEach(e => {
      const d = format(e.date, 'MMM dd');
      if (dailyData[d]) dailyData[d].expenses += e.amount;
    });

    // Category breakdown
    const salesByCategory: any = {};
    filteredData.filteredSales.forEach(s => {
      // Add safety check for items being undefined or not an array
      if (s.items && Array.isArray(s.items)) {
        s.items.forEach((item: any) => {
          const cat = item.category || 'Uncategorized';
          salesByCategory[cat] = (salesByCategory[cat] || 0) + ((item.price || 0) * (item.quantity || 0));
        });
      }
    });

    const expenseByCategory: any = {};
    filteredData.filteredExpenses.forEach(e => {
      const cat = e.category || 'General';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + e.amount;
    });

    return {
      totalSales,
      totalExpenses,
      totalPending,
      netProfit,
      dailyChartData: Object.values(dailyData),
      salesCategoryData: Object.entries(salesByCategory).map(([name, value]) => ({ name, value })),
      expenseCategoryData: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))
    };
  }, [filteredData]);

  const handleDownloadOverview = () => {
    const doc = new jsPDF();
    const rangeText = dateRange === 'today' ? 'Today' : 
                      dateRange === 'yesterday' ? 'Yesterday' :
                      dateRange === 'last7' ? 'Last 7 Days' :
                      dateRange === 'last30' ? 'Last 30 Days' :
                      dateRange === 'thisMonth' ? 'This Month' : 
                      dateRange === 'customMonth' ? format(new Date(selectedMonth + '-02'), 'MMMM yyyy') : 'Last Month';

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('Business Performance Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Period: ${rangeText} (${format(filteredData.start, 'MMM dd')} - ${format(filteredData.end, 'MMM dd, yyyy')})`, 105, 30, { align: 'center' });
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 105, 38, { align: 'center' });

    // Summary Table
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Amount (INR)']],
      body: [
        ['Total Sales', `INR ${stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Total Expenses', `INR ${stats.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Net Profit', `INR ${stats.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Outstanding Payments', `INR ${stats.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Performance_Report_${dateRange}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const handleDownloadDetail = () => {
    const doc = new jsPDF();
    const title = detailView === 'sales' ? 'Sales Detailed Report' :
                  detailView === 'expenses' ? 'Expense Detailed Report' :
                  detailView === 'profit' ? 'Profit & Loss Statement' : 'Pending Payments Report';

    doc.setFontSize(18);
    doc.text(title, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Period: ${dateRange.replace(/([A-Z])/g, ' $1')}`, 105, 28, { align: 'center' });

    if (detailView === 'expenses' || detailView === 'profit') {
      const expData = filteredData.filteredExpenses
        .filter(e => e.description.toLowerCase().includes(detailSearch.toLowerCase()))
        .map(e => [format(e.date, 'MMM dd, yyyy'), e.description, e.category, e.amount.toFixed(2)]);

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Description', 'Category', 'Amount (INR)']],
        body: expData,
        headStyles: { fillColor: [220, 38, 38] }
      });
    }

    if (detailView === 'sales' || detailView === 'pending' || detailView === 'profit') {
      const salesData = (detailView === 'profit' ? filteredData.filteredSales : 
                        detailView === 'pending' ? filteredData.filteredSales.filter(v => v.pendingAmount > 0) :
                        filteredData.filteredSales
                      ).filter(s => 
                        s.id.toLowerCase().includes(detailSearch.toLowerCase()) || 
                        (s.customerInfo?.name || '').toLowerCase().includes(detailSearch.toLowerCase())
                      ).map(s => [format(s.date, 'MMM dd, yyyy'), s.customerInfo?.name || 'Walk-in', s.paymentMethod, s.total.toFixed(2), s.pendingAmount.toFixed(2)]);

      autoTable(doc, {
        startY: detailView === 'profit' ? (doc as any).lastAutoTable.finalY + 20 : 40,
        head: [['Date', 'Customer', 'Method', 'Total (INR)', 'Pending (INR)']],
        body: salesData,
        headStyles: { fillColor: [37, 99, 235] }
      });
    }

    doc.save(`${title.replace(/ /g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Detailed performance breakdown of your business</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e: any) => setDateRange(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm appearance-none"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="customMonth">Custom Month</option>
            </select>
          </div>
          {dateRange === 'customMonth' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          )}
          <button 
            onClick={handleDownloadOverview}
            className="h-10 flex items-center justify-center space-x-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            id: 'sales',
            label: 'Total Sales', 
            value: stats.totalSales, 
            icon: TrendingUp, 
            color: 'text-indigo-600 dark:text-indigo-400', 
            bg: 'bg-indigo-50 dark:bg-indigo-500/10'
          },
          { 
            id: 'expenses',
            label: 'Total Expenses', 
            value: stats.totalExpenses, 
            icon: TrendingDown, 
            color: 'text-red-600 dark:text-red-400', 
            bg: 'bg-red-50 dark:bg-red-500/10'
          },
          { 
            id: 'profit',
            label: 'Net Profit', 
            value: stats.netProfit, 
            icon: DollarSign, 
            color: 'text-emerald-600 dark:text-emerald-400', 
            bg: 'bg-emerald-50 dark:bg-emerald-500/10'
          },
          { 
            id: 'pending',
            label: 'Pending Receivables', 
            value: stats.totalPending, 
            icon: AlertCircle, 
            color: 'text-amber-600 dark:text-amber-400', 
            bg: 'bg-amber-50 dark:bg-amber-500/10'
          },
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => {
              setDetailView(item.id as any);
              setDetailSearch('');
            }}
            className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.label}</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              ₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <div className="mt-auto flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 transform translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              <span>View details</span>
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Sales vs Expenses Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Revenue vs Expenses</h3>
              <p className="text-xs text-slate-500 mt-1">Daily comparison for the selected period</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-semibold text-slate-500">Sales</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                <span className="text-xs font-semibold text-slate-500">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={stats.dailyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(value) => `₹${value}`}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#f87171" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExpenses)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-6">Expenses Breakdown</h3>
          <div className="h-[200px] w-full flex-grow relative min-h-[200px]">
            {stats.expenseCategoryData.length > 0 ? (
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <LucidePieChartIcon className="h-10 w-10 opacity-50 mb-2" />
                <p className="text-xs font-medium">No expenses data</p>
              </div>
            )}
          </div>
          {stats.expenseCategoryData.length > 0 && (
            <div className="mt-6 space-y-3">
              {stats.expenseCategoryData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales by Category */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-6">Sales by Category</h3>
          <div className="h-[250px] w-full min-h-[250px]">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={stats.salesCategoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  width={100}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Mini List */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {filteredData.filteredSales.slice(0, 3).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{sale.customerInfo?.name || 'Walk-in Customer'}</p>
                    <p className="text-xs text-slate-500">{format(sale.date, 'MMM dd, yyyy • hh:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+₹{sale.total.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 capitalize">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
            {filteredData.filteredExpenses.slice(0, 2).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[150px]">{expense.description}</p>
                    <p className="text-xs text-slate-500">{format(expense.date, 'MMM dd, yyyy • hh:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">-₹{expense.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 capitalize">{expense.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Drill-down Modal */}
      {detailView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${
                  detailView === 'sales' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                  detailView === 'expenses' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                  detailView === 'profit' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {detailView === 'sales' ? <TrendingUp className="h-6 w-6" /> :
                   detailView === 'expenses' ? <TrendingDown className="h-6 w-6" /> :
                   detailView === 'profit' ? <DollarSign className="h-6 w-6" /> :
                   <AlertCircle className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {detailView === 'sales' ? 'Sales Details' :
                     detailView === 'expenses' ? 'Expense Details' :
                     detailView === 'profit' ? 'Profit & Loss Statement' :
                     'Pending Receivables'}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {dateRange.replace(/([A-Z])/g, ' $1')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDetailView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={detailSearch}
                  onChange={(e) => setDetailSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
              <button 
                onClick={handleDownloadDetail}
                className="w-full sm:w-auto h-10 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Modal Body - Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#18181b]">
              {detailView === 'sales' || detailView === 'pending' || detailView === 'profit' ? (
                <div className="mb-6">
                  {detailView === 'profit' && <h3 className="text-sm font-bold text-slate-900 dark:text-white px-6 py-4">Revenues</h3>}
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white dark:bg-slate-900 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Customer / Ref</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Amount</th>
                        {detailView !== 'pending' && <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Status</th>}
                        {detailView === 'pending' && <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Current Dues</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#18181b]">
                      {detailView === 'pending' ? (
                        customers.filter(c => 
                          (c.pendingPayment || 0) > 0 && 
                          c.name.toLowerCase().includes(detailSearch.toLowerCase())
                        ).map((customer) => (
                          <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                              {customer.updatedAt?.toDate ? format(customer.updatedAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-slate-900 dark:text-white">{customer.name}</p>
                              <p className="text-xs text-slate-500">{customer.phone || 'No phone'}</p>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                              ₹{(customer.totalSpent || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-red-500">₹{(customer.pendingPayment || 0).toLocaleString()}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        (detailView === 'profit' ? filteredData.filteredSales : filteredData.filteredSales)
                          .filter(s => 
                            s.id.toLowerCase().includes(detailSearch.toLowerCase()) || 
                            (s.customerInfo?.name || '').toLowerCase().includes(detailSearch.toLowerCase())
                          ).map((sale) => (
                            <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{format(sale.date, 'MMM dd, yyyy')}</td>
                              <td className="px-6 py-4">
                                <p className="font-medium text-slate-900 dark:text-white">{sale.customerInfo?.name || 'Walk-in'}</p>
                                <p className="text-xs text-slate-500">#{sale.id.slice(0, 8)}</p>
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">₹{sale.total.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right">
                                {sale.pendingAmount > 0 ? (
                                  <span className="text-amber-500 text-xs font-semibold px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-md">Partial</span>
                                ) : (
                                  <span className="text-emerald-500 text-xs font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-md">Paid</span>
                                )}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {detailView === 'expenses' || detailView === 'profit' ? (
                <div>
                  {detailView === 'profit' && <h3 className="text-sm font-bold text-slate-900 dark:text-white px-6 py-4 border-t border-slate-200 dark:border-slate-800">Expenses</h3>}
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white dark:bg-slate-900 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Description</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Category</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#18181b]">
                      {filteredData.filteredExpenses
                        .filter(e => e.description.toLowerCase().includes(detailSearch.toLowerCase()))
                        .map((expense) => (
                          <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{format(expense.date, 'MMM dd, yyyy')}</td>
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{expense.description}</td>
                            <td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-400">{expense.category}</td>
                            <td className="px-6 py-4 text-right font-medium text-red-500">-₹{expense.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Calculation</span>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase text-slate-400 mr-3">
                  {detailView === 'profit' ? 'Net Profit' : 'Total'}
                </span>
                <span className={`text-2xl font-bold tracking-tight ${
                  detailView === 'profit' && stats.netProfit < 0 ? 'text-red-500' :
                  detailView === 'profit' ? 'text-emerald-600 dark:text-emerald-400' :
                  detailView === 'expenses' ? 'text-red-600 dark:text-red-400' :
                  detailView === 'pending' ? 'text-amber-600 dark:text-amber-400' :
                  'text-indigo-600 dark:text-indigo-400'
                }`}>
                  ₹{(
                    detailView === 'sales' ? stats.totalSales :
                    detailView === 'expenses' ? stats.totalExpenses :
                    detailView === 'profit' ? stats.netProfit :
                    stats.totalPending
                  ).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
