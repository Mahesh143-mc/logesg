import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AlertTriangle, Package, X, Save, Search, Warehouse, IndianRupee, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export function Inventory() {
  const { theme } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState<number>(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('stock', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAdjustStock = async () => {
    if (!editingProduct) return;
    try {
      await updateDoc(doc(db, 'products', editingProduct.id), {
        stock: newStock
      });
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filterCategory === 'all' || p.category === filterCategory;
    const isLowStock = p.stock <= (p.lowStockThreshold || 5);
    const statusMatch = filterStatus === 'all' || (filterStatus === 'low' ? isLowStock : !isLowStock);
    return searchMatch && categoryMatch && statusMatch;
  });

  const pagedProducts = filteredProducts.slice(0, rowsPerPage);
  const categories = Array.from(new Set(products.map(p => p.category)));
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const lowStockCount = products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Track and manage your product stock levels</p>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Low Stock Items</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{lowStockCount}</p>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Products</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{products.length}</p>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Inventory Value</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">₹{totalStockValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-5 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stock Status</label>
                   <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="low">Low Stock</option>
                    <option value="healthy">In Stock</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rows per page</label>
                  <select 
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white appearance-none"
                  >
                    <option value={10}>10 Rows</option>
                    <option value={20}>20 Rows</option>
                    <option value={50}>50 Rows</option>
                  </select>
                </div>
              </div>
           </div>
        </div>

        {/* Products Table */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Product</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Category</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-center">Stock</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {pagedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 text-slate-400">
                           <Warehouse className="w-12 h-12 opacity-50" />
                           <p className="font-medium text-sm">No products found matching filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white text-base">{product.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">ID: {product.id.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-slate-900 dark:text-white text-base">{product.stock}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold",
                            product.stock <= (product.lowStockThreshold || 5)
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          )}>
                            {product.stock <= (product.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setEditingProduct(product);
                              setNewStock(product.stock);
                            }}
                            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Stock</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Update Stock</h2>
                <p className="text-sm text-slate-500 mt-1">{editingProduct.name}</p>
              </div>
              <button 
                onClick={() => setEditingProduct(null)} 
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">New Quantity</label>
                <div className="relative">
                   <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input
                    autoFocus
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustStock}
                  className="flex-1 h-11 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
