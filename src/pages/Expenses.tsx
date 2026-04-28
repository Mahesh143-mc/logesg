import { useState, useEffect, FormEvent } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Plus, Trash2, IndianRupee, Calendar, X, Search, ArrowDownRight, Tag } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export function Expenses() {
  const { theme } = useStore();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        dateValue: (doc.data().date as any)?.toDate() || new Date()
      })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'expenseCategories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setCategories(cats);
      if (cats.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: cats[0].name }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async (e: any) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addDoc(collection(db, 'expenseCategories'), {
        name: newCategoryName.trim(),
        createdAt: serverTimestamp()
      });
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'expenses'), {
        ...formData,
        date: serverTimestamp(),
        staffId: auth.currentUser?.uid,
      });
      setIsModalOpen(false);
      setFormData({ 
        description: '', 
        amount: 0, 
        category: categories.length > 0 ? categories[0].name : '' 
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingExpenseId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingExpenseId) {
      try {
        await deleteDoc(doc(db, 'expenses', deletingExpenseId));
        setIsDeleteModalOpen(false);
        setDeletingExpenseId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const filteredExpenses = expenses.filter(expense => {
    const searchMatch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
    
    let dateMatch = true;
    if (dateFilter.start && dateFilter.end) {
      const start = startOfDay(new Date(dateFilter.start));
      const end = endOfDay(new Date(dateFilter.end));
      dateMatch = isWithinInterval(expense.dateValue, { start, end });
    }

    return searchMatch && categoryMatch && dateMatch;
  });

  const pagedExpenses = filteredExpenses.slice(0, rowsPerPage);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Expenses</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage and track your company expenses</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Tag className="w-4 h-4" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Top Metrics & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Metric Card */}
          <div className="lg:col-span-1 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <IndianRupee className="w-24 h-24" />
            </div>
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">Total Expenses</span>
            </div>
            <h4 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              ₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h4>
            <p className="text-xs font-medium text-slate-400 mt-2">All time cumulative</p>
          </div>

          {/* Filters Card */}
          <div className="lg:col-span-3 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="w-full flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="w-full md:w-48 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Date Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  className="w-full md:w-36 h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
                <span className="text-slate-400 text-sm">-</span>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                  className="w-full md:w-36 h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div>
          <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {pagedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <IndianRupee className="w-8 h-8 opacity-50" />
                          </div>
                          <p className="text-sm font-medium">No expenses found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{expense.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3.5 h-3.5 mr-2" />
                            {format(expense.dateValue, 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-slate-900 dark:text-white">
                            ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredExpenses.length > rowsPerPage && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-center">
                 <button 
                   onClick={() => setRowsPerPage(prev => prev + 10)}
                   className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                 >
                   Load More
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Delete Expense?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Categories</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Category</label>
                <div className="flex space-x-2">
                  <input
                    required
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Travel"
                    className="flex-1 h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Existing Categories</h4>
              <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No categories added</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <span key={cat.id} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <input
                  required
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What was this expense for?"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  >
                    {categories.length === 0 && <option value="" disabled>No categories available</option>}
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
