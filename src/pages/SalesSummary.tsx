import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { PieChart, Calendar, IndianRupee, TrendingUp, PackageSearch } from 'lucide-react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subDays } from 'date-fns';

export function SalesSummary() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom'>('today');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const unsubscribeSales = onSnapshot(query(collection(db, 'sales')), (snapshot) => {
      setSales(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
      })));
    });

    const unsubscribeProducts = onSnapshot(query(collection(db, 'products')), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeSales();
      unsubscribeProducts();
    };
  }, []);

  const filteredSales = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (dateFilter) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        start = startOfDay(yesterday);
        end = endOfDay(yesterday);
        break;
      case 'this_week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          start = startOfDay(new Date(customDateRange.start));
          end = endOfDay(new Date(customDateRange.end));
        } else {
          start = new Date(0); // If custom is selected but no date is set, show all or none. Here we show all (fallback).
          end = endOfDay(now);
        }
        break;
      default:
        start = startOfDay(now);
        end = endOfDay(now);
    }

    return sales.filter(sale => {
      if (!sale.date) return false;
      return isWithinInterval(sale.date, { start, end });
    });
  }, [sales, dateFilter, customDateRange]);

  const summaryData = useMemo(() => {
    const productSummary: Record<string, { name: string; soldQty: number; salesAmount: number; investment: number; profit: number }> = {};
    let totalSoldQty = 0;
    let totalSalesAmount = 0;
    let totalInvestment = 0;
    let totalProfit = 0;

    filteredSales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          const qty = item.quantity || 0;
          const price = item.price || 0;
          let costPrice = item.costPrice || 0;
          
          if (!costPrice) {
            const productMatch = products.find(p => p.id === item.id);
            if (productMatch && productMatch.costPrice) {
              costPrice = productMatch.costPrice;
            }
          }

          const salesAmount = qty * price;
          const investment = qty * costPrice;
          const profit = salesAmount - investment;

          const key = item.id || item.name;

          if (!productSummary[key]) {
            productSummary[key] = {
              name: item.name,
              soldQty: 0,
              salesAmount: 0,
              investment: 0,
              profit: 0
            };
          }

          productSummary[key].soldQty += qty;
          productSummary[key].salesAmount += salesAmount;
          productSummary[key].investment += investment;
          productSummary[key].profit += profit;

          totalSoldQty += qty;
          totalSalesAmount += salesAmount;
          totalInvestment += investment;
          totalProfit += profit;
        });
      }
    });

    return {
      products: Object.values(productSummary).sort((a, b) => b.salesAmount - a.salesAmount),
      totals: { totalSoldQty, totalSalesAmount, totalInvestment, totalProfit }
    };
  }, [filteredSales, products]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Summary</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Inventory and Profit Summary</p>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full md:w-auto space-y-2 flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'this_week', label: 'This Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'custom', label: 'Custom' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setDateFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    dateFilter === filter.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {dateFilter === 'custom' && (
            <div className="w-full md:w-auto flex gap-3 items-center animate-in fade-in zoom-in-95">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
              <span className="text-slate-400 mt-6">-</span>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PackageSearch className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Sold Qty</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{summaryData.totals.totalSoldQty.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <IndianRupee className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Sales Amount</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">₹{summaryData.totals.totalSalesAmount.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <PieChart className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Investment</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">₹{summaryData.totals.totalInvestment.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Profit</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 tracking-tight">₹{summaryData.totals.totalProfit.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Sold Qty</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Sales Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Investment</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {summaryData.products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <PackageSearch className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm font-medium">No sales recorded for this period</p>
                    </div>
                  </td>
                </tr>
              ) : (
                summaryData.products.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.soldQty.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">₹{item.salesAmount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-500">₹{item.investment.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500">₹{item.profit.toLocaleString('en-IN')}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {summaryData.products.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-800">
                <tr>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">Total</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-white">{summaryData.totals.totalSoldQty.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-white">₹{summaryData.totals.totalSalesAmount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-white">₹{summaryData.totals.totalInvestment.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-emerald-600 dark:text-emerald-500">₹{summaryData.totals.totalProfit.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
