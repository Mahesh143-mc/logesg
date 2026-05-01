import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Leaf, ChevronRight, X, Minus, Plus, ShoppingCart, Loader2, CheckCircle, MapPin, User, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../utils/translations';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit?: string;
  imageUrl?: string;
  description?: string;
}

export function CustomerShop({ initialCategory }: { initialCategory?: string }) {
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart, isCartOpen, setCartOpen, language } = useStore();
  const t = useTranslation(language);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || t('all'));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    place: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    return [t('all'), ...cats];
  }, [products, t]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === t('all') || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.place) {
      alert(t('fill_all_details'));
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
      alert(t('error_occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-50 rounded-full blur-[120px]"
        />
      </div>

      {/* Header & Filters Section */}
      <div className="bg-white/90 backdrop-blur-3xl border-b border-slate-100 sticky top-14 md:top-[76px] z-30 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all shadow-sm font-medium"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                "flex items-center space-x-2 px-4 md:px-6 py-3 md:py-4 rounded-2xl border transition-all duration-300 font-black text-[10px] md:text-xs uppercase tracking-widest flex-shrink-0",
                selectedCategory !== t('all')
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20"
                  : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Leaf className={cn("w-4 h-4", selectedCategory !== t('all') ? "text-white" : "text-emerald-600")} />
              <span className="hidden sm:inline">{t('category')}: </span>
              <span className="max-w-[80px] sm:max-w-none truncate">{selectedCategory}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter"
          >
            {language === 'ta' ? (
              <>எங்கள் <span className="text-emerald-600">பொருட்கள்</span></>
            ) : (
              <>Our <span className="text-emerald-600">Products</span></>
            )}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 mt-4 text-lg font-medium"
          >
            {t('shop_desc')}
          </motion.p>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-emerald-200 hover:shadow-[0_30px_60px_rgba(16,185,129,0.12)] transition-all duration-500 group flex flex-col"
              >
                <div 
                  className="h-40 md:h-52 relative cursor-pointer overflow-hidden bg-slate-50 p-4 md:p-6 flex items-center justify-center"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={product.imageUrl || `https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop`} 
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 md:top-6 md:left-6">
                    <span className="px-3 py-1 md:px-4 md:py-1.5 bg-white/90 backdrop-blur-md rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-widest border border-white shadow-sm">
                      {product.category || (language === 'ta' ? 'பொதுவானவை' : 'General')}
                    </span>
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-6 right-6">
                      <span className="px-4 py-1.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30">
                        {t('low_stock')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <h3 className="text-[10px] md:text-sm font-black text-slate-900 tracking-tight line-clamp-1">{product.name}</h3>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-sm md:text-lg font-black text-emerald-600">₹{product.price.toLocaleString()}</span>
                      <span className="text-[8px] md:text-xs font-bold text-slate-400">/ {product.unit || '1kg'}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-[10px] md:text-sm mb-4 md:mb-8 line-clamp-2 leading-relaxed flex-1 font-medium">
                    {product.description || t('quality_desc')}
                  </p>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={product.stock <= 0}
                    onClick={() => addToCart({ ...product, quantity: 1 })}
                    className={cn(
                      "w-full py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black flex items-center justify-center space-x-1 md:space-x-2 transition-all text-[10px] md:text-sm uppercase tracking-widest",
                      product.stock <= 0 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 hover:border-emerald-600 shadow-sm"
                    )}
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{product.stock <= 0 ? t('out_of_stock') : t('add')}</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300 border border-slate-100">
              <Search className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">{t('no_products')}</h2>
            <p className="text-slate-500 mt-3 text-lg font-medium">{t('search_another')}</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory(t('all')); }}
              className="mt-8 text-emerald-600 font-black hover:text-emerald-700 transition-colors uppercase tracking-widest text-sm"
            >
              {t('clear_all')}
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 bg-slate-900 text-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-2xl flex items-center space-x-3 md:space-x-4 border border-white/10 group"
      >
        <div className="relative">
          <ShoppingBag className="w-7 h-7" />
          {cart.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 w-6 h-6 bg-emerald-500 rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-slate-900"
            >
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </motion.span>
          )}
        </div>
        <div className="text-left hidden md:block pl-4 border-l border-white/20">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('total')}</div>
          <div className="font-black text-lg">₹{cartTotal.toLocaleString()}</div>
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
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-[160] shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col"
            >
              {/* Checkout Success */}
              {isOrderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-emerald-50">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-600/40"
                  >
                    <CheckCircle className="w-12 h-12" />
                  </motion.div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">{t('order_placed')}</h2>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {t('order_success_desc')}
                  </p>
                </div>
              ) : isCheckingOut ? (
                <div className="flex flex-col h-full bg-white">
                  <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 bg-white/80 backdrop-blur-md">
                    <div>
                      <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{t('checkout')}</h2>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{t('delivery_details')}</p>
                    </div>
                    <button 
                      onClick={() => setIsCheckingOut(false)}
                      className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                    </button>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 md:space-y-6">
                    <div className="bg-slate-50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('full_name')}</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <input 
                            required
                            type="text" 
                            placeholder={language === 'ta' ? "உதாரணம்: லோகேஷ்" : "e.g. Logesh"}
                            value={customerDetails.name}
                            onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg md:rounded-xl py-2.5 md:py-3.5 pl-11 pr-6 text-xs md:text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('phone_number')}</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <input 
                            required
                            type="tel" 
                            placeholder="+91 98765 43210"
                            value={customerDetails.phone}
                            onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg md:rounded-xl py-2.5 md:py-3.5 pl-11 pr-6 text-xs md:text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('delivery_address')}</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-4 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <textarea 
                            required
                            rows={2}
                            placeholder={language === 'ta' ? "உங்கள் முழு முகவரியை இங்கே உள்ளிடவும்..." : "Enter your full address here..."}
                            value={customerDetails.place}
                            onChange={(e) => setCustomerDetails({...customerDetails, place: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg md:rounded-xl py-2.5 md:py-3.5 pl-11 pr-6 text-xs md:text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-5 md:p-6 bg-emerald-600 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-xl shadow-emerald-600/20 flex flex-col sm:flex-row justify-between items-start sm:items-center overflow-hidden relative gap-3">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="text-[9px] font-black text-emerald-100 uppercase tracking-widest mb-0.5">{t('total')}</div>
                        <div className="text-2xl md:text-3xl font-black">₹{cartTotal.toLocaleString()}</div>
                      </div>
                      <div className="relative z-10 flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-md md:rounded-lg border border-white/20 text-[9px] font-black uppercase tracking-widest">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{t('cod_available')}</span>
                      </div>
                    </div>
                  </form>

                  <div className="p-4 md:p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                    <button 
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                      className="w-full py-3.5 md:py-4 bg-slate-900 text-white font-black rounded-lg md:rounded-xl flex items-center justify-center space-x-3 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all disabled:opacity-70 active:scale-95 uppercase tracking-widest text-[11px] md:text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{t('processing')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('confirm_order')}</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-white">
                  <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 bg-white/80 backdrop-blur-md">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t('your_cart')}</h2>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{cart.length} {t('items')}</p>
                    </div>
                    <button 
                      onClick={() => setCartOpen(false)}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 border border-slate-100">
                          <ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <div className="space-y-2 px-6">
                          <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t('cart_empty')}</p>
                          <p className="text-sm text-slate-500 font-medium">{language === 'ta' ? 'நீங்கள் இன்னும் எதையும் சேர்க்கவில்லை.' : "You haven't added anything yet."}</p>
                        </div>
                        <button 
                          onClick={() => setCartOpen(false)}
                          className="mt-4 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 uppercase tracking-widest transition-all"
                        >
                          {t('start_shopping')}
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          className="flex bg-white p-3 md:p-4 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm space-x-4 group"
                        >
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden bg-slate-50 border border-slate-50 flex-shrink-0 p-2 md:p-4">
                            <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/300/300`} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-slate-900 text-sm md:text-lg line-clamp-1 tracking-tight pr-2">{item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center space-x-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                                <button onClick={() => updateCartQuantity(item.id, item.quantity - 0.1)} className="w-7 h-7 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-colors">
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="text-[10px] font-black text-slate-900 w-8 text-center">{item.quantity.toFixed(1)}</span>
                                <button onClick={() => updateCartQuantity(item.id, item.quantity + 0.1)} className="w-7 h-7 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-colors">
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                              <p className="font-black text-emerald-600 text-base md:text-xl">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-6 md:p-8 bg-white border-t border-slate-100 sticky bottom-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest">{t('total')}</span>
                        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full py-4 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black flex items-center justify-center space-x-3 shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-95 uppercase tracking-widest text-sm md:text-base"
                      >
                        <span>{t('checkout')}</span>
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Category Selection Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">{t('category')}</h3>
                  <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{language === 'ta' ? `மொத்தம் ${categories.length} வகைகள்` : `Total ${categories.length} categories`}</p>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsFilterOpen(false);
                      }}
                      className={cn(
                        "flex items-center p-2 rounded-lg md:rounded-xl border transition-all duration-300 space-x-2.5",
                        selectedCategory === cat
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10"
                          : "bg-slate-50 text-slate-600 border-slate-100 hover:border-emerald-200 hover:bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center shadow-sm flex-shrink-0",
                        selectedCategory === cat ? "bg-white/20 text-white" : "bg-white text-emerald-600 border border-slate-100"
                      )}>
                        <Leaf className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-tight truncate">{cat}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-3 md:p-5 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/5 hover:bg-slate-800 transition-all"
                >
                  {language === 'ta' ? 'மூடு' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedProduct(null);
                setSelectedWeight(1);
              }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-4xl h-auto md:h-[65vh] max-h-[85vh] bg-white rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              {/* Close Button - Moved to absolute top-right for mobile visibility */}
              <button 
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedWeight(1);
                }} 
                className="absolute top-4 right-4 md:top-8 md:right-8 z-20 p-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl text-slate-900 shadow-xl hover:bg-white transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="md:w-1/2 h-56 md:h-auto bg-slate-50 relative border-b md:border-b-0 md:border-r border-slate-100 p-6 md:p-10 flex items-center justify-center">
                <motion.img 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  src={selectedProduct.imageUrl || `https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop`} 
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 md:top-8 md:left-8">
                  <span className="px-4 py-1.5 md:px-5 md:py-2 bg-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-widest shadow-sm border border-slate-100">
                    {selectedProduct.category || (language === 'ta' ? 'பொதுவானவை' : 'General')}
                  </span>
                </div>
              </div>
              
              <div className="md:w-1/2 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                  <div className="flex justify-between items-start mb-4 md:mb-5">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight pr-4">{selectedProduct.name}</h2>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-5 md:mb-6">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl md:text-4xl font-black text-emerald-600 tracking-tighter">₹{selectedProduct.price.toLocaleString()}</span>
                      <span className="text-sm md:text-base font-bold text-slate-400">/ {selectedProduct.unit || '1kg'}</span>
                    </div>
                    <span className="text-[10px] md:text-xs font-black text-emerald-700 px-3 py-1 md:px-4 md:py-1.5 bg-emerald-50 rounded-lg md:rounded-xl uppercase tracking-widest border border-emerald-100">
                      {selectedProduct.stock > 0 ? t('in_stock') : t('out_of_stock')}
                    </span>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3">{t('description')}</h4>
                      <p className="text-slate-500 leading-relaxed text-base md:text-lg font-medium">
                        {selectedProduct.description || t('quality_desc')}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { title: t('quality_assured'), desc: t('freshness_desc') },
                        { title: t('natural_title'), desc: t('chemical_free_desc') }
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center space-x-4 p-5 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100 flex-shrink-0">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">{feat.title}</h5>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(selectedProduct.unit?.toLowerCase().includes('kg') || !selectedProduct.unit) && (
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3">{language === 'ta' ? 'எடையை தேர்வு செய்யவும்' : 'Select Weight (kg)'}</h4>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3 bg-white rounded-xl p-1 shadow-sm border border-emerald-200">
                            <button 
                              onClick={() => setSelectedWeight(Math.max(0.1, selectedWeight - 0.1))}
                              className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input 
                              type="number"
                              step="0.1"
                              value={selectedWeight}
                              onChange={(e) => setSelectedWeight(parseFloat(e.target.value) || 0.1)}
                              className="w-16 text-center font-black text-emerald-900 bg-transparent border-none outline-none text-lg"
                            />
                            <button 
                              onClick={() => setSelectedWeight(selectedWeight + 0.1)}
                              className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-lg font-black text-emerald-900">kg</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-white border-t border-slate-100 sticky bottom-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={selectedProduct.stock <= 0}
                    onClick={() => {
                      addToCart({ ...selectedProduct, quantity: selectedWeight });
                      setSelectedProduct(null);
                      setSelectedWeight(1);
                      setCartOpen(true);
                    }}
                    className="w-full py-4 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black flex items-center justify-center space-x-3 md:space-x-4 shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-sm md:text-base"
                  >
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                    <span>{selectedProduct.stock > 0 ? t('add_to_cart') : t('out_of_stock')}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
