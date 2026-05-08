import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, setDoc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Save,
  Loader2,
  Settings2,
  TrendingUp,
  Layout,
  X,
  Target,
  ArrowUpCircle,
  Edit3,
  Check,
  Download
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, isToday as isDateToday, isFuture } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface Column {
  id: string;
  name: string;
  order: number;
}

interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  data: Record<string, number>;
}

export function DailyUpdate() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const tableRef = React.useRef<HTMLDivElement>(null);
  const todayRef = React.useRef<HTMLTableRowElement>(null);

  // Fetch columns
  useEffect(() => {
    const q = query(collection(db, 'dailyIncomeColumns'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setColumns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Column)));
    });
    return unsubscribe;
  }, []);

  // Fetch entries for the selected month
  useEffect(() => {
    setIsLoading(true);
    const q = query(
      collection(db, 'dailyIncomeEntries'),
      where('monthYear', '==', selectedMonth)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry)));
      setIsLoading(false);
    });
    return unsubscribe;
  }, [selectedMonth]);

  // Generate days for the selected month
  const days = useMemo(() => {
    const start = startOfMonth(parseISO(selectedMonth + '-01'));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  }, [selectedMonth]);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    try {
      await addDoc(collection(db, 'dailyIncomeColumns'), {
        name: newColName.trim(),
        order: columns.length,
        createdAt: serverTimestamp()
      });
      setNewColName('');
    } catch (err) {
      toast.error('Failed to add column');
    }
  };

  const handleDeleteColumn = async (id: string) => {
    if (!confirm('Are you sure you want to delete this column? Data for this column will be hidden from totals.')) return;
    try {
      await deleteDoc(doc(db, 'dailyIncomeColumns', id));
      toast.success('Column removed');
    } catch (error) {
      toast.error('Failed to remove column');
    }
  };

  const handleUpdateColumnName = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateDoc(doc(db, 'dailyIncomeColumns', id), {
        name: editingName.trim()
      });
      setEditingColId(null);
      toast.success('Column renamed');
    } catch (error) {
      toast.error('Failed to rename column');
    }
  };

  const handleExportExcel = () => {
    try {
      const data = days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = entries.find(e => e.id === dateStr);
        
        const row: any = {
          'Date': format(date, 'dd/MM/yyyy'),
          'Day': format(date, 'EEEE'),
        };

        columns.forEach(col => {
          row[col.name] = entry?.data[col.id] || 0;
        });

        row['Daily Total'] = totalByDay(date);
        return row;
      });

      // Add Grand Total Row
      const grandTotalRow: any = {
        'Date': 'GRAND TOTAL',
        'Day': '',
      };
      columns.forEach(col => {
        grandTotalRow[col.name] = totalsByColumn[col.id];
      });
      grandTotalRow['Daily Total'] = grandTotal;
      data.push(grandTotalRow);

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Daily Income');
      
      const fileName = `Daily_Income_${format(parseISO(selectedMonth + '-01'), 'MMM_yyyy')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Excel exported successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
      console.error(error);
    }
  };

  const scrollToToday = () => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (!isLoading && isSameMonth(parseISO(selectedMonth + '-01'), new Date())) {
      setTimeout(scrollToToday, 500);
    }
  }, [isLoading, selectedMonth]);

  const handleUpdateAmount = async (date: Date, colId: string, amountStr: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const amount = parseFloat(amountStr) || 0;
    const entryId = dateStr;
    const entry = entries.find(e => e.id === entryId);

    try {
      if (entry) {
        await updateDoc(doc(db, 'dailyIncomeEntries', entryId), {
          [`data.${colId}`]: amount,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(doc(db, 'dailyIncomeEntries', entryId), {
          date: dateStr,
          monthYear: selectedMonth,
          data: { [colId]: amount },
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save amount');
    }
  };

  // Calculations
  const totalsByColumn = useMemo(() => {
    const totals: Record<string, number> = {};
    columns.forEach(col => {
      totals[col.id] = entries.reduce((acc: number, entry) => acc + (entry.data[col.id] || 0), 0);
    });
    return totals;
  }, [columns, entries]);

  const totalByDay = (date: Date) => {
    const entry = entries.find(e => e.id === format(date, 'yyyy-MM-dd'));
    if (!entry) return 0;
    // Only sum values for columns that currently exist
    return columns.reduce((acc: number, col) => acc + (entry.data[col.id] || 0), 0);
  };

  const grandTotal = useMemo(() => {
    return Object.values(totalsByColumn).reduce((acc: number, val: number) => acc + val, 0);
  }, [totalsByColumn]);

  // Local Input Component for better performance
  const DailyInput = ({ date, colId, initialValue, disabled }: { date: Date, colId: string, initialValue: number, disabled?: boolean }) => {
    const [val, setVal] = useState(initialValue || '');
    
    useEffect(() => {
      setVal(initialValue || '');
    }, [initialValue]);

    return (
      <input
        type="number"
        placeholder="0"
        value={val}
        disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onBlur={(e) => handleUpdateAmount(date, colId, e.target.value)}
        className={cn(
          "w-full h-full px-6 py-4 bg-transparent text-center text-sm font-bold outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          disabled 
            ? "text-slate-400 dark:text-slate-600 cursor-not-allowed" 
            : "text-slate-900 dark:text-white focus:bg-indigo-50/50 dark:focus:bg-indigo-500/5"
        )}
      />
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-[#002B5B] flex items-center justify-center shadow-lg shadow-blue-900/20">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#002B5B] dark:text-white tracking-tight">Daily Income Sheet</h1>
            <p className="text-sm text-slate-500 font-medium">Monthly Financial Tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSameMonth(parseISO(selectedMonth + '-01'), new Date()) && (
            <button
              onClick={scrollToToday}
              className="flex items-center gap-2 px-4 h-11 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Today</span>
            </button>
          )}
          <div className="flex items-center bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm">
            <button 
              onClick={() => {
                const prev = new Date(selectedMonth + '-01');
                prev.setMonth(prev.getMonth() - 1);
                setSelectedMonth(format(prev, 'yyyy-MM'));
              }}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}
            </div>
            <button 
              onClick={() => {
                const next = new Date(selectedMonth + '-01');
                next.setMonth(next.getMonth() + 1);
                setSelectedMonth(format(next, 'yyyy-MM'));
              }}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsColModalOpen(true)}
            className="flex items-center gap-2 px-4 h-11 bg-[#002B5B] text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Settings2 className="w-4 h-4" />
            <span>Setup Columns</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-colors">
        <div ref={tableRef} className="overflow-x-auto custom-scrollbar max-h-[70vh]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#002B5B] transition-colors border-b border-slate-200 dark:border-white/10">
                <th className="sticky left-0 z-20 bg-slate-50 dark:bg-[#002B5B] px-6 py-5 text-left text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest border-r border-slate-200 dark:border-white/10 min-w-[120px]">
                  Date
                </th>
                {columns.map(col => (
                  <th key={col.id} className="px-6 py-5 text-center text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest border-r border-slate-200 dark:border-white/10 min-w-[140px]">
                    {col.name}
                  </th>
                ))}
                <th className="px-6 py-5 text-center text-[11px] font-black text-indigo-600 dark:text-emerald-400 uppercase tracking-widest min-w-[140px]">
                  Total (Per Day)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
              {days.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const entry = entries.find(e => e.id === dateStr);
                const isToday = isDateToday(date);

                return (
                  <tr 
                    key={dateStr} 
                    ref={isToday ? todayRef : null}
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group",
                      isToday && "bg-indigo-50/80 dark:bg-blue-900/10 ring-2 ring-inset ring-indigo-500/20"
                    )}
                  >
                    <td className={cn(
                      "sticky left-0 z-10 px-6 py-4 border-r border-slate-100 dark:border-slate-800 font-bold text-sm transition-colors shadow-[4px_0_10px_rgba(0,0,0,0.02)]",
                      isToday ? "bg-blue-50 dark:bg-slate-900 text-blue-600" : "bg-white dark:bg-[#18181b] text-slate-700 dark:text-slate-300"
                    )}>
                      {format(date, 'dd/MM')}
                      <span className="ml-2 text-[10px] text-slate-400 font-medium uppercase">{format(date, 'EEE')}</span>
                    </td>
                    {columns.map(col => (
                      <td key={col.id} className="p-0 border-r border-slate-100 dark:border-slate-800">
                        <DailyInput 
                          date={date} 
                          colId={col.id} 
                          initialValue={entry?.data[col.id] || 0} 
                          disabled={isFuture(date) && !isDateToday(date)}
                        />
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center font-black text-slate-900 dark:text-white bg-slate-50/30 dark:bg-zinc-800/30">
                      ₹{totalByDay(date).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer Totals */}
            <tfoot className="bg-emerald-50/50 dark:bg-emerald-500/10 transition-colors border-t-2 border-emerald-100 dark:border-emerald-500/20">
              <tr>
                <td className="sticky left-0 z-10 bg-emerald-50 dark:bg-[#064e3b]/30 px-6 py-6 border-r border-emerald-100 dark:border-emerald-500/20 text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
                  Total Income
                </td>
                {columns.map(col => (
                  <td key={col.id} className="px-6 py-6 text-center font-black text-emerald-700 dark:text-emerald-400 border-r border-emerald-100 dark:border-emerald-500/20">
                    ₹{totalsByColumn[col.id].toLocaleString()}
                  </td>
                ))}
                <td className="px-6 py-6 text-center font-black text-emerald-800 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-500/20">
                  ₹{grandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Grand Total Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#020617] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/5 px-8">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-6 h-10 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-xl p-2 px-8 border border-slate-200 dark:border-white/10 shadow-lg flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-500 dark:text-blue-200 uppercase tracking-widest">Grand Total</span>
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter font-mono">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="w-40 hidden sm:block"></div> {/* Spacer to keep total centered */}
        </div>
      </div>

      {/* Column Setup Modal */}
      {isColModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Configure Columns</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Add or remove income source columns</p>
              </div>
              <button onClick={() => setIsColModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <form onSubmit={handleAddColumn} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Sales, Rent, etc."
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 h-11 bg-[#002B5B] text-white rounded-xl text-sm font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {columns.map((col) => (
                  <div key={col.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:border-[#002B5B]/30 transition-all">
                    {editingColId === col.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateColumnName(col.id);
                            if (e.key === 'Escape') setEditingColId(null);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-indigo-500 bg-white dark:bg-slate-900 text-sm font-bold outline-none"
                        />
                        <button 
                          onClick={() => handleUpdateColumnName(col.id)}
                          className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{col.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingColId(col.id);
                              setEditingName(col.name);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteColumn(col.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {columns.length === 0 && (
                  <div className="py-12 text-center">
                    <Layout className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500 font-medium italic">No columns defined yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsColModalOpen(false)}
                className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
