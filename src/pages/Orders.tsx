import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { 
  Search, 
  Eye, 
  Calendar,
  User,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Trash2,
  X
} from 'lucide-react';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // We fetch type 'online_order' specifically and sort client-side to avoid complex indexes
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

      // Sort by date descending
      docs.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

      // Filter out completed and cancelled orders
      setOrders(docs.filter((order: any) => order.status === 'pending' || order.status === 'shipped'));
    });
    return unsubscribe;
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'sales', orderId);
      await updateDoc(orderRef, { status: newStatus });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchMatch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo?.place || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    
    return searchMatch && statusMatch;
  });

  const pagedOrders = filteredOrders.slice(0, rowsPerPage);

  const deleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
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
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col space-y-2 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Orders</h1>
        <p className="text-sm font-medium text-slate-500">Manage and process customer orders</p>
      </header>

      {/* Top Filters */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm flex flex-col md:flex-row items-end gap-4">
        <div className="w-full flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="w-full md:w-56 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
          >
            <option value="all">All Active Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>

        <div className="w-full md:w-32 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Show</label>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID & Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Quick Actions</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm font-medium">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">#{order.id.slice(0, 8)}</span>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {format(order.date, 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{order.customerInfo?.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[180px]">{order.customerInfo?.place}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border capitalize",
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">₹{order.total.toLocaleString('en-IN')}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{order.items.length} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-colors"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Details</h2>
                <div className="flex items-center mt-1.5 space-x-3">
                  <span className="text-sm font-medium text-slate-500">#{selectedOrder.id}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-semibold border capitalize",
                    getStatusColor(selectedOrder.status)
                  )}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Customer Info */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Customer Information</h3>
                <div className="bg-slate-50 dark:bg-[#18181b] rounded-xl p-5 border border-slate-200/60 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedOrder.customerInfo?.name}</p>
                      <p className="text-xs text-slate-500">Name</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedOrder.customerInfo?.phone}</p>
                      <p className="text-xs text-slate-500">Phone</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:col-span-2">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedOrder.customerInfo?.place}</p>
                      <p className="text-xs text-slate-500">Address</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Items List */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Order Items</h3>
                <div className="bg-slate-50 dark:bg-[#18181b] rounded-xl border border-slate-200/60 dark:border-zinc-800 overflow-hidden">
                  <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <li key={i} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Amount</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Updates */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Update Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all space-y-2 group",
                      selectedOrder.status === 'pending' 
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' 
                        : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <Clock className={cn("w-5 h-5", selectedOrder.status === 'pending' ? "text-amber-600 dark:text-amber-400" : "text-slate-400")} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pending</span>
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all space-y-2 group",
                      selectedOrder.status === 'shipped' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                        : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <Truck className={cn("w-5 h-5", selectedOrder.status === 'shipped' ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Shipped</span>
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all space-y-2 group",
                      selectedOrder.status === 'delivered' 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                        : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <CheckCircle2 className={cn("w-5 h-5", selectedOrder.status === 'delivered' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Delivered</span>
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all space-y-2 group",
                      selectedOrder.status === 'cancelled' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-500/10' 
                        : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <XCircle className={cn("w-5 h-5", selectedOrder.status === 'cancelled' ? "text-red-600 dark:text-red-400" : "text-slate-400")} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Cancelled</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
