import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, UserPlus, Search, Phone, History as HistoryIcon, CreditCard, X, Calendar, ShoppingBag, Trash2, Mail, MapPin, Filter, ChevronRight, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export function Customers() {
  const { theme } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [customerSales, setCustomerSales] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', place: '' });
  
  const [historyDateFilter, setHistoryDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'customers'), {
        ...formData,
        loyaltyPoints: 0,
        pendingPayment: 0,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', place: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewHistory = async (customer: any) => {
    setSelectedCustomer(customer);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      let q = query(
        collection(db, 'sales'),
        where('customerInfo.phone', '==', customer.phone)
      );
      let snapshot = await getDocs(q);
      let sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (sales.length === 0 && customer.name) {
        q = query(
          collection(db, 'sales'),
          where('customerInfo.name', '==', customer.name)
        );
        snapshot = await getDocs(q);
        sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      sales.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate()?.getTime() || 0;
        const dateB = b.createdAt?.toDate()?.getTime() || 0;
        return dateB - dateA;
      });
      setCustomerSales(sales);
    } catch (err) {
      console.error('Error fetching customer history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    setDeletingCustomerId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (deletingCustomerId) {
      try {
        await deleteDoc(doc(db, 'customers', deletingCustomerId));
        setIsDeleteModalOpen(false);
        setDeletingCustomerId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredHistory = customerSales.filter(sale => {
    if (!historyDateFilter.start || !historyDateFilter.end) return true;
    const saleDate = sale.createdAt?.toDate() || new Date();
    const start = startOfDay(new Date(historyDateFilter.start));
    const end = endOfDay(new Date(historyDateFilter.end));
    return isWithinInterval(saleDate, { start, end });
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header section */}
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Customers</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your customer relationships and history</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-4 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </header>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors">
            
            {/* Customer Card Header */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                   {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                   <div className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                     {customer.loyaltyPoints} Points
                   </div>
                   <div className="flex items-center space-x-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Active</span>
                   </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">{customer.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Customer</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="px-6 py-4 space-y-3 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{customer.phone || 'No phone'}</span>
              </div>
              {customer.email && (
                <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-medium truncate">{customer.email}</span>
                </div>
              )}
              {customer.place && (
                <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-medium truncate">{customer.place}</span>
                </div>
              )}
            </div>

            {/* Customer Card Footer */}
            <div className="mt-auto p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Pending Due</span>
                <span className={cn(
                  "text-lg font-bold tracking-tight",
                  customer.pendingPayment > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  ₹{customer.pendingPayment?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleViewHistory(customer)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm outline-none"
                >
                  History
                </button>
                <button 
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors outline-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 text-center">
            <Users className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-base font-medium text-slate-900 dark:text-white">No customers found</p>
            <p className="text-sm mt-1">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white text-center tracking-tight mb-2">Delete Customer?</h2>
            <p className="text-sm text-slate-500 text-center mb-6">Are you sure you want to remove this customer? This action cannot be undone.</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCustomer}
                className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase History</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{selectedCustomer?.name}</p>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center bg-white dark:bg-[#18181b]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date Range</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="date"
                  value={historyDateFilter.start}
                  onChange={(e) => setHistoryDateFilter({...historyDateFilter, start: e.target.value})}
                  className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="date"
                  value={historyDateFilter.end}
                  onChange={(e) => setHistoryDateFilter({...historyDateFilter, end: e.target.value})}
                  className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:border-indigo-500 dark:text-white"
                />
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30 dark:bg-[#18181b]">
              {isLoadingHistory ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-slate-500">
                  <ShoppingBag className="mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium">No purchase history found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((sale) => (
                    <div key={sale.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{format(sale.createdAt?.toDate() || new Date(), 'MMM dd, yyyy · hh:mm a')}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold capitalize">
                          {sale.paymentMethod}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {sale.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                              <span className="text-slate-500 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/50">
                        <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                        <span className="font-bold text-lg text-slate-900 dark:text-white">₹{sale.total.toLocaleString()}</span>
                      </div>
                      
                      {sale.pendingAmount > 0 && (
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="font-medium text-red-600 dark:text-red-400">Pending</span>
                          <span className="font-bold text-red-600 dark:text-red-400">₹{sale.pendingAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
               <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Customer</h2>
                <p className="text-sm text-slate-500 mt-1">Add a new customer to your directory</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input
                    required
                    autoFocus
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                <div className="relative">
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                    placeholder="City, District"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email (Optional)</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
