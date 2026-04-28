import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { 
  Search, 
  ChevronRight, 
  Eye, 
  Calendar,
  User,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const q = query(
      collection(db, 'sales'), 
      where('type', '==', 'online_order')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
      }));

      // Sort and filter client-side to avoid complex indexes
      const filtered = docs
        .filter((order: any) => ['delivered', 'cancelled'].includes(order.status))
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

      setOrders(filtered);
    });
    return unsubscribe;
  }, []);

  const filteredOrders = orders.filter(order => {
    return order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo?.place || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pagedOrders = filteredOrders.slice(0, rowsPerPage);

  const deleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this historical order?')) {
      try {
        await deleteDoc(doc(db, 'sales', id));
        if (selectedOrder?.id === id) {
          setSelectedOrder(null);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-tighter leading-none">Order Archive</h1>
          <p className="text-lg font-medium text-slate-400 mt-2">Deep audit of completed and voided protocols</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search Archives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72 h-16 rounded-[24px] border border-gray-100 bg-white py-3 pl-14 pr-6 text-sm font-bold outline-none focus:border-indigo-600/30 transition-all shadow-xl shadow-slate-200/50"
            />
          </div>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="h-16 rounded-[24px] border border-gray-100 bg-white px-8 text-xs font-bold text-slate-600 outline-none shadow-xl shadow-slate-200/50 transition-all focus:border-indigo-600/30 appearance-none uppercase tracking-widest min-w-[140px]"
          >
            <option value={10}>View 10</option>
            <option value={20}>View 20</option>
            <option value={50}>View 50</option>
            <option value={100}>View 100</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <div className="admin-card !p-0 overflow-hidden bg-white border-none shadow-2xl shadow-slate-200/60 rounded-[48px]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-10 py-8 text-[11px] font-bold uppercase text-slate-400 tracking-widest">Reference</th>
                  <th className="px-10 py-8 text-[11px] font-bold uppercase text-slate-400 tracking-widest">Client Identity</th>
                  <th className="px-10 py-8 text-[11px] font-bold uppercase text-slate-400 tracking-widest">Geography</th>
                  <th className="px-10 py-8 text-[11px] font-bold uppercase text-slate-400 tracking-widest">Archival State</th>
                  <th className="px-10 py-8 text-[11px] font-bold uppercase text-slate-400 tracking-widest text-right">Fiscal Value</th>
                  <th className="px-10 py-8 text-[11px] font-bold uppercase text-slate-400 tracking-widest text-center">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-200 space-y-6">
                        <ShoppingBag className="w-24 h-24 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No archival records identified</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                      <td className="px-10 py-10">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 mb-1 tracking-tighter uppercase">ARCH-{order.id.slice(0, 8)}</span>
                          <div className="flex items-center text-[10px] text-slate-400 font-bold tracking-tight">
                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                            {format(order.date, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex items-center space-x-5">
                          <div className="w-14 h-14 rounded-[20px] bg-indigo-50 flex items-center justify-center text-indigo-600 transform group-hover:rotate-6 transition-all shadow-inner">
                            <User className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-900 leading-none mb-2 tracking-tight">{order.customerInfo?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-tight">{order.customerInfo?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex items-center text-sm font-bold text-slate-900 tracking-tighter uppercase">
                          <MapPin className="w-5 h-5 mr-3 text-indigo-500" />
                          {order.customerInfo?.place}
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <span className={cn(
                          "inline-flex items-center px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                          getStatusColor(order.status)
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <p className="text-2xl font-bold text-slate-900 leading-none tracking-tighter">₹{order.total.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-2">{order.items.length} units archived</p>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex items-center justify-center space-x-4">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white hover:bg-indigo-600 transition-all transform active:scale-90 shadow-xl shadow-slate-900/10"
                          >
                            <Eye className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => deleteOrder(order.id)}
                            className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all transform active:scale-90 border border-red-50 shadow-sm"
                          >
                            <Trash2 className="w-6 h-6" />
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
      </div>

      {/* History Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60">
          <div className="w-full max-w-3xl rounded-[60px] bg-white p-16 shadow-2xl border-none animate-in fade-in zoom-in duration-300 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="mb-14 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 uppercase tracking-tighter leading-none">Archived Protocol</h2>
                <div className="flex items-center mt-4 space-x-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">#{selectedOrder.id.toUpperCase()}</span>
                  <span className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-xl transition-all"
              >
                <XCircle className="w-10 h-10" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-14">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                   <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer History</h4>
                </div>
                <div className="p-8 bg-slate-50 rounded-[40px] space-y-6 border border-slate-100 shadow-inner">
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                      <User className="w-6 h-6" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 leading-none">{selectedOrder.customerInfo?.name}</p>
                  </div>
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                      <Phone className="w-6 h-6" />
                    </div>
                    <p className="text-lg font-bold text-slate-600">{selectedOrder.customerInfo?.phone}</p>
                  </div>
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest leading-tight">{selectedOrder.customerInfo?.place}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                   <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Harvest Snapshot</h4>
                </div>
                <div className="p-8 bg-slate-50 rounded-[40px] space-y-6 border border-slate-100 shadow-inner">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-900 tracking-tight">{item.name}</span>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Qty: {item.quantity}</span>
                      </div>
                      <span className="text-xl font-bold text-slate-900 tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-slate-200/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Archive</span>
                    <span className="text-4xl font-bold text-slate-900 tracking-tighter">₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedOrder(null)}
              className="h-24 w-full rounded-[40px] bg-slate-900 py-4 font-bold text-white text-[11px] uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-emerald-600 transition-all transform active:scale-95"
            >
              Confirm Audit Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
