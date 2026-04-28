import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Leaf, ChevronRight, X, Minus, Plus, ShoppingCart, Loader2, CheckCircle, MapPin, User, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
}

export function CustomerShop({ initialCategory = 'All' }: { initialCategory?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    place: ''
  });
  
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart, isCartOpen, setCartOpen } = useStore();

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product)));
    });
    return unsubscribe;
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category || 'Uncategorized')));
    return ['All', ...cats];
  }, [products]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.place) {
      alert('Please fill in all details');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        createdAt: serverTimestamp(),
        customerInfo: {
          name: customerDetails.name,
          phone: customerDetails.phone,
          place: customerDetails.place,
          email: '' 
        },
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: cartTotal,
        paymentMethod: 'cash_on_delivery',
        status: 'pending',
        pendingAmount: cartTotal,
        type: 'online_order'
      };

      await addDoc(collection(db, 'sales'), orderData);
      
      setIsOrderPlaced(true);
      clearCart();
      setTimeout(() => {
        setIsOrderPlaced(false);
        setIsCheckingOut(false);
        setCartOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header & Filters */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-[80px] z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Products</h1>
          <p className="text-slate-500 mt-2">Explore our premium selection of farm-fresh goods.</p>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                <div 
                  className="aspect-square relative cursor-pointer overflow-hidden bg-slate-100 p-6 flex items-center justify-center"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={product.imageUrl || `https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop`} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-700 uppercase tracking-wider border border-slate-200/50 shadow-sm">
                      {product.category || 'Standard'}
                    </span>
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Low Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight line-clamp-1">{product.name}</h3>
                    <p className="text-xl font-bold text-indigo-600 mt-1">₹{product.price.toLocaleString()}</p>
                  </div>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                    {product.description || 'Premium quality harvest meticulously grown and selected for your table.'}
                  </p>
                  
                  <button
                    disabled={product.stock <= 0}
                    onClick={() => addToCart({ ...product, quantity: 1 })}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all active:scale-95 text-sm",
                      product.stock <= 0 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No products found</h2>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-6 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCartOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center space-x-3 border border-white/10 group"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </div>
        <div className="text-left hidden md:block pl-2 border-l border-white/20">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cart Total</div>
          <div className="font-bold text-sm">₹{cartTotal}</div>
        </div>
      </motion.button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmitting) {
                  setCartOpen(false);
                  setIsCheckingOut(false);
                }
              }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              {/* Checkout Success */}
              {isOrderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6"
                  >
                    <CheckCircle className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">Order Confirmed</h2>
                  <p className="text-slate-500 leading-relaxed">
                    Thank you for your purchase. We will deliver your products shortly.
                  </p>
                </div>
              ) : isCheckingOut ? (
                <div className="flex flex-col h-full bg-slate-50">
                  <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Checkout</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">Delivery details</p>
                    </div>
                    <button 
                      onClick={() => setIsCheckingOut(false)}
                      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required
                            type="text" 
                            placeholder="John Doe"
                            value={customerDetails.name}
                            onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required
                            type="tel" 
                            placeholder="+91 98765 43210"
                            value={customerDetails.phone}
                            onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 ml-1">Delivery Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <textarea 
                            required
                            rows={3}
                            placeholder="Full address"
                            value={customerDetails.place}
                            onChange={(e) => setCustomerDetails({...customerDetails, place: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="text-xs font-semibold text-indigo-600/80 mb-1">Total Amount</div>
                        <div className="text-2xl font-bold text-indigo-700">₹{cartTotal}</div>
                      </div>
                      <div className="flex items-center space-x-2 text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>COD Available</span>
                      </div>
                    </div>
                  </form>

                  <div className="p-6 bg-white border-t border-slate-200 sticky bottom-0 z-10">
                    <button 
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                      className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-70 active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Order</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-slate-50">
                  <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Your Cart</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">{cart.length} items</p>
                    </div>
                    <button 
                      onClick={() => setCartOpen(false)}
                      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-slate-900">Cart is empty</p>
                          <p className="text-sm text-slate-500">Looks like you haven't added anything yet.</p>
                        </div>
                        <button 
                          onClick={() => setCartOpen(false)}
                          className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-slate-800"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-x-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                            <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/300/300`} className="w-full h-full object-cover mix-blend-multiply" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="flex items-center space-x-3 bg-slate-50 rounded-lg p-1 border border-slate-200/60">
                                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-semibold text-slate-900 w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="font-bold text-indigo-600">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-6 bg-white border-t border-slate-200 sticky bottom-0 z-10">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-medium text-slate-500">Subtotal</span>
                        <span className="text-xl font-bold text-slate-900">₹{cartTotal}</span>
                      </div>
                      <button 
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                      >
                        <span>Checkout</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 h-64 md:h-auto bg-slate-50 relative border-b md:border-b-0 md:border-r border-slate-200 p-8 flex items-center justify-center">
                <img 
                  src={selectedProduct.imageUrl || `https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop`} 
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-white rounded-lg text-xs font-semibold text-slate-700 uppercase tracking-wide shadow-sm border border-slate-200">
                    {selectedProduct.category}
                  </span>
                </div>
              </div>
              
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight pr-4">{selectedProduct.name}</h2>
                  <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-baseline space-x-3 mb-8">
                  <span className="text-3xl font-bold text-indigo-600">₹{selectedProduct.price}</span>
                  <span className="text-sm font-medium text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
                    {selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-slate-500 leading-relaxed text-sm">
                      {selectedProduct.description || 'Premium quality product, verified and tested. Delivered fresh with our guaranteed quality standards.'}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-slate-200">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-slate-900">Quality Assured</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Tested for freshness and purity</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button
                    disabled={selectedProduct.stock <= 0}
                    onClick={() => {
                      addToCart({ ...selectedProduct, quantity: 1 });
                      setSelectedProduct(null);
                      setCartOpen(true);
                    }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:grayscale active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
