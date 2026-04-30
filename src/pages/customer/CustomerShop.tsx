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

export function CustomerShop({ initialCategory = 'அனைத்தும்' }: { initialCategory?: string }) {
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
    return ['அனைத்தும்', ...cats];
  }, [products]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'அனைத்தும்' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.place) {
      alert('தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும்');
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
      alert('ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.');
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

      {/* Header & Filters */}
      <div className="bg-white/70 backdrop-blur-2xl border-b border-slate-100 sticky top-[80px] z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Category Pills */}
            <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-black whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat 
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="பொருட்களைத் தேடுக..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-medium"
              />
            </div>
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
            எங்கள் <span className="text-emerald-600">பொருட்கள்</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 mt-4 text-lg font-medium"
          >
            எங்களின் தரமான விவசாயத் தயாரிப்புகளை இங்கே காணலாம்.
          </motion.p>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-emerald-200 hover:shadow-[0_30px_60px_rgba(16,185,129,0.12)] transition-all duration-500 group flex flex-col"
              >
                <div 
                  className="aspect-square relative cursor-pointer overflow-hidden bg-slate-50 p-8 flex items-center justify-center"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={product.imageUrl || `https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop`} 
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-emerald-700 uppercase tracking-widest border border-white shadow-sm">
                      {product.category || 'பொதுவானவை'}
                    </span>
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-6 right-6">
                      <span className="px-4 py-1.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30">
                        இருப்பு குறைவு
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1">{product.name}</h3>
                    <p className="text-2xl font-black text-emerald-600 mt-2">₹{product.price.toLocaleString()}</p>
                  </div>
                  <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed flex-1 font-medium">
                    {product.description || 'மிகவும் கவனத்துடன் விளைவிக்கப்பட்ட பிரீமியம் தரமான தயாரிப்பு.'}
                  </p>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={product.stock <= 0}
                    onClick={() => addToCart({ ...product, quantity: 1 })}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black flex items-center justify-center space-x-2 transition-all text-sm uppercase tracking-widest",
                      product.stock <= 0 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 hover:border-emerald-600 shadow-sm"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{product.stock <= 0 ? 'இருப்பு இல்லை' : 'கூடையில் சேர்க்க'}</span>
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
            <h2 className="text-2xl font-black text-slate-900">தயாரிப்புகள் எதுவும் இல்லை</h2>
            <p className="text-slate-500 mt-3 text-lg font-medium">வேறு வார்த்தைகளில் தேடிப் பார்க்கவும்.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('அனைத்தும்'); }}
              className="mt-8 text-emerald-600 font-black hover:text-emerald-700 transition-colors uppercase tracking-widest text-sm"
            >
              அனைத்தையும் நீக்க
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
        className="fixed bottom-10 right-10 z-40 bg-slate-900 text-white p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center space-x-4 border border-white/10 group"
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
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">மொத்தம்</div>
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-[70] shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col"
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
                  <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">ஆர்டர் உறுதி செய்யப்பட்டது</h2>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    உங்கள் வாங்குதலுக்கு நன்றி. விரைவில் உங்கள் பொருட்கள் விநியோகிக்கப்படும்.
                  </p>
                </div>
              ) : isCheckingOut ? (
                <div className="flex flex-col h-full bg-slate-50">
                  <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">செக்அவுட்</h2>
                      <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">விநியோக விவரங்கள்</p>
                    </div>
                    <button 
                      onClick={() => setIsCheckingOut(false)}
                      className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">முழு பெயர்</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required
                            type="text" 
                            placeholder="உதாரணம்: லோகேஷ்"
                            value={customerDetails.name}
                            onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">தொலைபேசி எண்</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required
                            type="tel" 
                            placeholder="+91 98765 43210"
                            value={customerDetails.phone}
                            onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-800 ml-1 uppercase tracking-widest">விநியோக முகவரி</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                          <textarea 
                            required
                            rows={3}
                            placeholder="முழு முகவரி"
                            value={customerDetails.place}
                            onChange={(e) => setCustomerDetails({...customerDetails, place: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-600/30 flex justify-between items-center overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="text-xs font-black text-emerald-100 uppercase tracking-widest mb-2">மொத்த தொகை</div>
                        <div className="text-4xl font-black">₹{cartTotal.toLocaleString()}</div>
                      </div>
                      <div className="relative z-10 flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest">
                        <CheckCircle className="w-4 h-4" />
                        <span>COD உண்டு</span>
                      </div>
                    </div>
                  </form>

                  <div className="p-8 bg-white border-t border-slate-100 sticky bottom-0 z-10">
                    <button 
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                      className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center space-x-3 shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all disabled:opacity-70 active:scale-95 uppercase tracking-widest"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>செயலாக்கப்படுகின்றன...</span>
                        </>
                      ) : (
                        <>
                          <span>ஆர்டரை உறுதிப்படுத்து</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-slate-50">
                  <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">உங்கள் கூடை</h2>
                      <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">{cart.length} பொருட்கள்</p>
                    </div>
                    <button 
                      onClick={() => setCartOpen(false)}
                      className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-100 shadow-sm">
                          <ShoppingCart className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-black text-slate-900 tracking-tight">கூடை காலியாக உள்ளது</p>
                          <p className="text-slate-500 font-medium">நீங்கள் இன்னும் எதையும் சேர்க்கவில்லை.</p>
                        </div>
                        <button 
                          onClick={() => setCartOpen(false)}
                          className="mt-4 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 uppercase tracking-widest transition-all"
                        >
                          ஷாப்பிங் செய்ய
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          className="flex bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-x-6 group"
                        >
                          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-50 flex-shrink-0 p-4">
                            <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/300/300`} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-slate-900 text-lg line-clamp-1 tracking-tight">{item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="flex items-center space-x-4 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-colors">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-colors">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="font-black text-emerald-600 text-xl">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-8 bg-white border-t border-slate-100 sticky bottom-0 z-10">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">மொத்தம்</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center space-x-3 shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-95 uppercase tracking-widest"
                      >
                        <span>செக்அவுட்</span>
                        <ChevronRight className="w-6 h-6" />
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
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 h-80 md:h-auto bg-slate-50 relative border-b md:border-b-0 md:border-r border-slate-100 p-12 flex items-center justify-center">
                <motion.img 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  src={selectedProduct.imageUrl || `https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop`} 
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-10 left-10">
                  <span className="px-5 py-2 bg-white rounded-2xl text-xs font-black text-emerald-700 uppercase tracking-widest shadow-sm border border-slate-100">
                    {selectedProduct.category}
                  </span>
                </div>
              </div>
              
              <div className="md:w-1/2 p-12 md:p-16 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight pr-4">{selectedProduct.name}</h2>
                  <button onClick={() => setSelectedProduct(null)} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex items-baseline space-x-4 mb-10">
                  <span className="text-5xl font-black text-emerald-600 tracking-tighter">₹{selectedProduct.price.toLocaleString()}</span>
                  <span className="text-xs font-black text-emerald-700 px-4 py-1.5 bg-emerald-50 rounded-xl uppercase tracking-widest border border-emerald-100">
                    {selectedProduct.stock > 0 ? 'இருப்பில் உள்ளது' : 'இருப்பு இல்லை'}
                  </span>
                </div>
                
                <div className="flex-1 space-y-10">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">விளக்கம்</h4>
                    <p className="text-slate-500 leading-relaxed text-lg font-medium">
                      {selectedProduct.description || 'மிகவும் கவனத்துடன் விளைவிக்கப்பட்ட பிரீமியம் தரமான தயாரிப்பு. எங்களின் நேரடி பண்ணைகளில் இருந்து இயற்கையான முறையில் வளர்க்கப்பட்டது.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { title: 'தரம் உறுதி செய்யப்பட்டது', desc: 'புத்துணர்ச்சி மற்றும் தூய்மைக்காக சோதிக்கப்பட்டது' },
                      { title: '100% இயற்கை', desc: 'இரசாயன உரங்கள் இன்றி விளைவிக்கப்பட்டது' }
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center space-x-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100 flex-shrink-0">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">{feat.title}</h5>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-slate-100">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={selectedProduct.stock <= 0}
                    onClick={() => {
                      addToCart({ ...selectedProduct, quantity: 1 });
                      setSelectedProduct(null);
                      setCartOpen(true);
                    }}
                    className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black flex items-center justify-center space-x-4 shadow-2xl shadow-emerald-600/40 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-lg"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span>{selectedProduct.stock > 0 ? 'கூடையில் சேர்க்க' : 'இருப்பு இல்லை'}</span>
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
