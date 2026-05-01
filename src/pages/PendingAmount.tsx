import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { 
  IndianRupee, 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  AlertCircle,
  Download,
  ArrowRight,
  Plus,
  Check,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export function PendingAmount() {
  const { theme, setCurrentAdminPage } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Payment Collection State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | 'upi'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'customers'),
      where('pendingPayment', '>', 0)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      docs.sort((a, b) => (b.pendingPayment || 0) - (a.pendingPayment || 0));
      setCustomers(docs);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const totalPending = customers.reduce((acc, curr) => acc + (curr.pendingPayment || 0), 0);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount || isSubmitting) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }

    if (amount > selectedCustomer.pendingPayment) {
      toast.error(`Amount exceeds pending balance (Max: ₹${selectedCustomer.pendingPayment})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        type: 'payment_received',
        total: amount,
        paymentMethod: paymentMethod,
        createdAt: serverTimestamp(),
        status: 'completed'
      };
      await addDoc(collection(db, 'sales'), paymentData);

      const newPending = selectedCustomer.pendingPayment - amount;
      await updateDoc(doc(db, 'customers', selectedCustomer.id), {
        pendingPayment: newPending,
        updatedAt: serverTimestamp()
      });

      setSelectedCustomer(null);
      setPaymentAmount('');
      toast.success('Payment collected successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to collect payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToExcel = () => {
    const headers = ['Customer Name', 'Phone', 'Location', 'Pending Amount', 'Last Updated'];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.phone || 'N/A',
      c.place || 'N/A',
      c.pendingPayment,
      c.updatedAt?.toDate ? format(c.updatedAt.toDate(), 'MMM dd, yyyy') : 'N/A'
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pending Payments');
    XLSX.writeFile(workbook, `pending_payments_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header section */}
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pending Payments</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Track and manage outstanding balances from customers</p>
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
            onClick={exportToExcel}
            className="h-11 px-4 flex items-center justify-center space-x-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-semibold whitespace-nowrap outline-none"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
              <IndianRupee className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pending</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">₹{totalPending.toLocaleString()}</span>
            <span className="text-xs font-bold text-red-500">outstanding</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Debtors</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{customers.length}</span>
            <span className="text-xs font-bold text-slate-500">customers</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg. Per Customer</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{customers.length > 0 ? Math.round(totalPending / customers.length).toLocaleString() : 0}
            </span>
            <span className="text-xs font-bold text-slate-500">average</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Customer</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Contact</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Pending Amount</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center space-y-2">
                      <IndianRupee className="h-8 w-8 text-slate-300" />
                      <p className="font-medium text-slate-900 dark:text-white">No pending amounts found</p>
                      <p className="text-xs">All accounts are currently clear!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-400 font-bold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{customer.place || 'No location'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-zinc-400">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium">{customer.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg shadow-sm shadow-red-100 dark:shadow-none">
                        ₹{customer.pendingPayment.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setPaymentAmount(customer.pendingPayment.toString());
                          }}
                          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none active:scale-95"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Pay Now</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentAdminPage('customers');
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all active:scale-90"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-zinc-800">
            <div className="relative p-8 pb-6">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-6 right-6 p-2 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                  <CreditCard className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Record Payment</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{selectedCustomer.name}</p>
                </div>
              </div>
              
              <div className="p-5 bg-red-50/50 dark:bg-red-500/5 rounded-3xl border border-red-100 dark:border-red-500/10 mb-8">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Total Outstanding</span>
                    <span className="text-2xl font-black text-red-600">₹{selectedCustomer.pendingPayment.toLocaleString()}</span>
                 </div>
              </div>

              <form onSubmit={handleCollectPayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₹</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full h-16 pl-10 pr-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-2xl font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <MethodButton active={paymentMethod === 'cash'} onClick={() => setPaymentMethod('cash')} icon={Banknote} label="Cash" />
                    <MethodButton active={paymentMethod === 'online'} onClick={() => setPaymentMethod('online')} icon={CreditCard} label="Online" />
                    <MethodButton active={paymentMethod === 'upi'} onClick={() => setPaymentMethod('upi')} icon={Smartphone} label="UPI" />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="flex-1 h-12 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-[2] h-12 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[2.5px]" />
                        <span>Confirm Payment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MethodButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-3 rounded-xl border transition-all space-y-2",
        active 
          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
          : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-800 text-slate-500 hover:border-indigo-300 dark:hover:border-indigo-500/50"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
