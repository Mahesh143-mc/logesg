import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { m, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Leaf,
  ChevronRight,
  X,
  Minus,
  Plus,
  ShoppingCart,
  Loader2,
  CheckCircle,
  MapPin,
  User,
  Phone,
  Heart,
  Eye,
  ChevronDown,
  Sparkles,
  ArrowUp,
  SlidersHorizontal,
  LayoutGrid,
  Grid2X2,
  Grid3X3,
  Star,
  Check,
  TrendingUp,
  ShieldCheck,
  Truck,
  Gift,
  Tag,
  FileText
} from 'lucide-react';
import { cn, getOptimizedUrl } from '../../lib/utils';
import { useTranslation } from '../../utils/translations';
import Swal from 'sweetalert2';

// Extracted worker components
import { ProductCard } from '../../components/customer/shop/ProductCard';
import { DesktopFilters, MobileFilters } from '../../components/customer/shop/ShopFilters';
import { QuickViewModal } from '../../components/customer/shop/QuickViewModal';
import { ProductDetailsModal } from '../../components/customer/shop/ProductDetailsModal';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit?: string;
  imageUrl?: string;
  description?: string;
  visible?: boolean;
}

export function CustomerShop({ initialCategory }: { initialCategory?: string }) {
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart, isCartOpen, setCartOpen, language } = useStore();
  const t = useTranslation(language);

  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [units, setUnits] = useState<any[]>([]);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(20);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || t('all'));
  const [priceRange, setPriceRange] = useState<string>('all');
  const [availability, setAvailability] = useState<string>('all'); // all, instock
  const [organicFilter, setOrganicFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured'); // featured, price-asc, price-desc, name-asc

  // UI Presentation States
  const [gridCols, setGridCols] = useState<number>(4); // 2, 3, 4 cols
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    place: ''
  });

  const [siteImages, setSiteImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSiteImages = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'frontendImages');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSiteImages(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching site images:", error);
      }
    };
    fetchSiteImages();
  }, []);

  // Accordion Sidebar Collapses
  const [collapseCat, setCollapseCat] = useState(true);
  const [collapsePrice, setCollapsePrice] = useState(true);
  const [collapseStock, setCollapseStock] = useState(true);
  const [collapseType, setCollapseType] = useState(true);

  // Fetch Products & Units
  useEffect(() => {
    // 1. Check for Saved Data on Page Load
    const cachedProducts = localStorage.getItem('shopProductsCache');
    if (cachedProducts) {
      try {
        const parsed = JSON.parse(cachedProducts);
        if (parsed && parsed.length > 0) {
          setProducts(parsed);
          setIsLoadingProducts(false); // Do not show spinner
        }
      } catch (e) {
        console.error("Failed to parse cached products", e);
      }
    }

    // 2. Fetch Fresh Data in the Background
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const freshProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      
      // 3 & 4. Compare, Update Screen, and Overwrite Old Memory
      setProducts(freshProducts);
      setIsLoadingProducts(false);
      localStorage.setItem('shopProductsCache', JSON.stringify(freshProducts));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'units'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const isDecimalAllowed = (unitName?: string) => {
    if (!unitName) return false;
    const unitObj = units.find(u => u.name.toLowerCase() === unitName.toLowerCase());
    return unitObj ? unitObj.allowDecimal : false;
  };

  // Get Dynamic Categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category || 'Uncategorized')));
    return [t('all'), ...cats];
  }, [products, t]);

  // Wishlist Action
  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(product => {
      const isVisible = product.visible !== false;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === t('all') || product.category === selectedCategory;

      // Price filter
      let matchesPrice = true;
      if (priceRange === 'under50') matchesPrice = product.price < 50;
      else if (priceRange === '50-150') matchesPrice = product.price >= 50 && product.price <= 150;
      else if (priceRange === 'over150') matchesPrice = product.price > 150;

      // Availability filter
      let matchesAvailability = true;
      if (availability === 'instock') matchesAvailability = product.stock > 0;

      // Organic filter (Mock: categories containing 'organic' or marked as premium)
      let matchesOrganic = true;
      if (organicFilter) {
        matchesOrganic = product.name.toLowerCase().includes('organic') ||
          product.category.toLowerCase().includes('organic') ||
          product.price > 80; // mock organic
      }

      return isVisible && matchesSearch && matchesCategory && matchesPrice && matchesAvailability && matchesOrganic;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchTerm, selectedCategory, priceRange, availability, organicFilter, sortBy, t]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerDetails.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'பெயர் தேவை' : 'Name Required',
        text: language === 'ta' ? 'தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.' : 'Please enter your full name.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'OK'
      });
      return;
    }

    const cleanPhone = customerDetails.phone.replace(/\D/g, '');
    if (!customerDetails.phone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'தொலைபேசி எண் தேவை' : 'Phone Number Required',
        text: language === 'ta' ? 'தயவுசெய்து உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter your phone number.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'OK'
      });
      return;
    } else if (cleanPhone.length < 10 || cleanPhone.length > 12) {
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'தவறான தொலைபேசி எண்' : 'Invalid Phone Number',
        text: language === 'ta' ? 'தயவுசெய்து செல்லுபடியாகும் 10-இலக்க தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit phone number.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!customerDetails.place.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'முகவரி தேவை' : 'Address Required',
        text: language === 'ta' ? 'தயவுசெய்து உங்கள் விநியோக முகவரியை உள்ளிடவும்.' : 'Please enter your delivery address.',
        confirmButtonColor: '#059669',
        confirmButtonText: 'OK'
      });
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
        type: 'online_order',
        staffId: 'online'
      };

      await addDoc(collection(db, 'sales'), orderData);

      // Construct WhatsApp Direct Message Invoice
      const itemsList = cart.map(item => `• *${item.name}* (${item.quantity} x ₹${item.price})`).join('\n');
      const whatsappMessage = `*New Order Placed!* 🎉\n\n` +
        `*Customer Details:*\n` +
        `• *Name:* ${customerDetails.name}\n` +
        `• *Phone:* ${customerDetails.phone}\n` +
        `• *Address:* ${customerDetails.place}\n\n` +
        `*Items Ordered:*\n${itemsList}\n\n` +
        `*Total Price:* ₹${cartTotal.toLocaleString()}\n` +
        `*Payment Method:* Cash on Delivery\n` +
        `*Status:* Pending\n\n` +
        `Thank you for shopping with us! 🌿`;

      const whatsappUrl = `https://wa.me/918754621690?text=${encodeURIComponent(whatsappMessage)}`;

      setIsOrderPlaced(true);
      clearCart();
      
      setTimeout(() => {
        setIsOrderPlaced(false);
        setIsCheckingOut(false);
        setCartOpen(false);
        window.location.href = whatsappUrl;
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Order Failed',
        text: language === 'ta' ? 'மன்னிக்கவும், உங்கள் ஆர்டரைச் சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Sorry, we could not place your order. Please try again.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-32 relative overflow-x-hidden overflow-y-auto font-sans antialiased">

      {/* Background Decorative Ambient Orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <m.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[140px]"
        />
        <m.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 left-0 w-[700px] h-[700px] bg-lime-100/25 rounded-full blur-[160px]"
        />
      </div>

      {/* 1. Hero Banner Section */}
      <section className="relative w-full h-[360px] md:h-[420px] pt-24 md:pt-28 flex items-center overflow-hidden">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={getOptimizedUrl(siteImages.shop_hero || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop", 2000)}
            alt="Farm Products Banner"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-zinc-950/90 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/30 via-transparent to-transparent z-10" />
        </div>

        {/* Hero Grid Container */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-white space-y-3">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-xs md:text-sm font-semibold tracking-wide text-emerald-300/80">
              <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => window.location.reload()}>{language === 'ta' ? 'முகப்பு' : 'Home'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'அனைத்து தொகுப்புகள்' : 'All collections'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-emerald-100 font-bold">{language === 'ta' ? 'பொருட்கள்' : 'Products'}</span>
            </nav>

            <m.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
            >
              {language === 'ta' ? 'பண்ணை பொருட்கள்' : 'Farm Products'}
            </m.h1>
            <m.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-emerald-200/80 text-sm md:text-base max-w-xl font-medium tracking-wide"
            >
              {language === 'ta' ? 'விவசாயப் பண்ணைகளிலிருந்து நேரடியாக புதிய பொருட்கள்' : 'Fresh products directly from farms'}
            </m.p>
          </div>

          {/* Search Bar inside Hero aligned right */}
          <div className="w-full md:w-[360px] lg:w-[420px] flex-shrink-0">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white border border-transparent rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-emerald-550/30 focus:border-emerald-500 transition-all font-medium shadow-xl"
              />
              <AnimatePresence>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Filter/Sort Bar */}
      <div className="lg:hidden bg-white/90 backdrop-blur-2xl border-b border-slate-200/70 sticky top-20 z-30 transition-all duration-300 shadow-sm py-3 px-4 flex items-center justify-between">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center space-x-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs uppercase tracking-wider"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ta' ? 'வடிகட்டி' : 'Filters'}</span>
          {selectedCategory !== t('all') && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
        <div className="flex items-center space-x-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">{language === 'ta' ? 'வரிசைப்படுத்து' : 'Sort By'}:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="featured">{language === 'ta' ? 'சிறப்பு பொருட்கள்' : 'Featured'}</option>
            <option value="price-asc">{language === 'ta' ? 'விலை: குறைந்ததிலிருந்து' : 'Price: Low to High'}</option>
            <option value="price-desc">{language === 'ta' ? 'விலை: அதிகத்திலிருந்து' : 'Price: High to Low'}</option>
            <option value="name-asc">{language === 'ta' ? 'பெயர்: A-Z' : 'Name: A to Z'}</option>
          </select>
        </div>
      </div>

      {/* 2. Main Layout Grid */}
      <main className="w-full max-w-[98%] mx-auto px-4 lg:px-6 py-10">
        <div className="grid grid-cols-12 gap-8">

          {/* Left Sidebar Filter Section (Desktop) */}
          <DesktopFilters
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            availability={availability}
            setAvailability={setAvailability}
            organicFilter={organicFilter}
            setOrganicFilter={setOrganicFilter}
            language={language}
            t={t}
          />

          {/* Right Product Grid + Top Toolbar */}
          <div className="col-span-12 lg:col-span-9 space-y-6">

            {/* 4. Top Toolbar */}
            <div className="hidden lg:flex bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm items-center justify-between gap-4">
              {/* Product Count Display */}
              <div className="text-xs md:text-sm text-slate-500 font-medium">
                {language === 'ta' ? (
                  <>மொத்தம் <span className="font-bold text-slate-800">{filteredAndSortedProducts.length}</span> பொருட்கள் கண்டறியப்பட்டன</>
                ) : (
                  <>Showing <span className="font-bold text-slate-800">{filteredAndSortedProducts.length}</span> products found</>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">

                {/* Sort Dropdown (Desktop) */}
                <div className="hidden sm:flex items-center space-x-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ta' ? 'வரிசைப்படுத்து' : 'Sort By'}:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200/80 py-2 px-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-300 transition-colors"
                  >
                    <option value="featured">{language === 'ta' ? 'சிறப்பு பொருட்கள்' : 'Featured'}</option>
                    <option value="price-asc">{language === 'ta' ? 'விலை: குறைந்ததிலிருந்து' : 'Price: Low to High'}</option>
                    <option value="price-desc">{language === 'ta' ? 'விலை: அதிகத்திலிருந்து' : 'Price: High to Low'}</option>
                    <option value="name-asc">{language === 'ta' ? 'பெயர்: A-Z' : 'Name: A to Z'}</option>
                  </select>
                </div>

                {/* Grid layout switcher (Shopify style | || ||| ||||) */}
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">{language === 'ta' ? 'காட்சி' : 'View'}:</span>
                  <div className="flex items-center bg-slate-100 rounded-lg p-1 space-x-0.5">
                    <button
                      onClick={() => setGridCols(2)}
                      className={cn("p-1.5 rounded-md transition-all", gridCols === 2 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                      aria-label="2 Columns"
                    >
                      <Grid2X2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGridCols(3)}
                      className={cn("p-1.5 rounded-md transition-all", gridCols === 3 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                      aria-label="3 Columns"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGridCols(4)}
                      className={cn("p-1.5 rounded-md transition-all", gridCols === 4 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                      aria-label="4 Columns"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedCategory !== t('all') || priceRange !== 'all' || availability !== 'all' || organicFilter) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider mr-1">{language === 'ta' ? 'தேர்வு செய்தவை' : 'Active Filters'}:</span>
                {selectedCategory !== t('all') && (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
                    <span>{selectedCategory}</span>
                    <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => setSelectedCategory(t('all'))} />
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
                    <span>
                      {priceRange === 'under50' && (language === 'ta' ? '₹50-க்கு கீழ்' : 'Under ₹50')}
                      {priceRange === '50-150' && (language === 'ta' ? '₹50 - ₹150' : '₹50 to ₹150')}
                      {priceRange === 'over150' && (language === 'ta' ? '₹150-க்கு மேல்' : 'Over ₹150')}
                    </span>
                    <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => setPriceRange('all')} />
                  </span>
                )}
                {availability !== 'all' && (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
                    <span>{language === 'ta' ? 'இருப்பில் உள்ளது' : 'In stock'}</span>
                    <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => setAvailability('all')} />
                  </span>
                )}
                {organicFilter && (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
                    <span>{language === 'ta' ? 'ஆர்கானிக்' : 'Organic'}</span>
                    <X className="w-3 h-3 cursor-pointer hover:text-emerald-900" onClick={() => setOrganicFilter(false)} />
                  </span>
                )}
              </div>
            )}

            {/* 5. Product Grid */}
            {isLoadingProducts && products.length === 0 ? (
              <div className="flex justify-center items-center py-32">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-emerald-800/60 font-black text-sm uppercase tracking-widest animate-pulse">
                    {language === 'ta' ? 'தயாரிப்புகளை ஏற்றுகிறது...' : 'Loading Freshness...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6 transition-all duration-500",
                gridCols === 2 && "grid-cols-2",
                gridCols === 3 && "grid-cols-2 md:grid-cols-3",
              gridCols === 4 && "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            )}>
              <AnimatePresence mode="popLayout">
                {filteredAndSortedProducts.slice(0, visibleCount).map((product, idx) => {
                  const hasDiscount = false;
                  const retailPrice = product.price;

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      idx={idx}
                      language={language}
                      t={t}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                      setSelectedProduct={setSelectedProduct}
                      setQuickViewProduct={setQuickViewProduct}
                      addToCart={addToCart}
                      hasDiscount={hasDiscount}
                      retailPrice={retailPrice}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
            )}
            
            {/* Load More Button */}
            {!isLoadingProducts && visibleCount < filteredAndSortedProducts.length && (
              <div className="flex justify-center mt-12 mb-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="px-8 py-3 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-sm active:scale-95 flex items-center space-x-2"
                >
                  <span>{language === 'ta' ? 'மேலும் காண்க' : 'Load More Products'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* Zero State View */}
            {!isLoadingProducts && filteredAndSortedProducts.length === 0 && (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300 border border-slate-100">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-black text-slate-900">{t('no_products')}</h2>
                <p className="text-slate-500 mt-2 text-sm font-medium max-w-sm mx-auto">{t('search_another')}</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(t('all'));
                    setPriceRange('all');
                    setAvailability('all');
                    setOrganicFilter(false);
                  }}
                  className="mt-6 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black hover:text-white transition-colors uppercase tracking-widest text-xs rounded-xl shadow-sm"
                >
                  {t('clear_all')}
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Floating Cart Trigger Button */}
      <m.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] bg-emerald-600 text-white py-3 px-5 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.4)] flex items-center space-x-3 border-2 border-white group"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {cart.length > 0 && (
            <m.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 w-5 h-5 bg-emerald-500 rounded-full text-[9px] font-black flex items-center justify-center shadow-md border border-zinc-950"
            >
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </m.span>
          )}
        </div>
        <div className="text-left pl-3 border-l border-white/25">
          <div className="text-[8px] font-black text-emerald-100 uppercase tracking-widest">{t('total')}</div>
          <div className="font-black text-sm">₹{cartTotal.toLocaleString()}</div>
        </div>
      </m.button>

      {/* Cart Sidebar Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmitting) {
                  setCartOpen(false);
                  setIsCheckingOut(false);
                }
              }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[150]"
            />
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[160] shadow-[0_0_80px_rgba(0,0,0,0.15)] flex flex-col"
            >
              {/* Checkout Success */}
              {isOrderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-emerald-50">
                  <m.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-10 h-10" />
                  </m.div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">{t('order_placed')}</h2>
                  <p className="text-slate-655 text-sm leading-relaxed font-semibold px-4">
                    {t('order_success_desc')}
                  </p>
                </div>
              ) : isCheckingOut ? (
                <div className="flex flex-col h-full bg-white">
                  <div className="p-5 border-b border-emerald-900/10 flex justify-between items-center sticky top-0 z-10 bg-emerald-100/70">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-emerald-800 tracking-tight uppercase">{t('checkout')}</h2>
                      <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">{t('delivery_details')}</p>
                    </div>
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="w-9 h-9 rounded-full bg-white hover:bg-emerald-600 border border-emerald-900/10 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-sm cursor-pointer duration-300 hover:rotate-180 active:scale-95"
                    >
                      <ChevronRight className="w-4.5 h-4.5 rotate-180" />
                    </button>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
                    <div className="bg-slate-100/80 p-6 rounded-3xl border border-slate-200/50 space-y-6 shadow-sm">
                      <div className="space-y-1.5">
                        <label className="text-[14px] md:text-[15px] font-black text-emerald-800/70 uppercase tracking-wider ml-1.5">{t('full_name')}</label>
                        <div className="relative group">
                          <User className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-600 transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            required
                            type="text"
                            placeholder={language === 'ta' ? "உதாரணம்: லோகேஷ்" : "e.g. Logesh"}
                            value={customerDetails.name}
                            onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl py-3.5 pl-12 pr-5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:shadow-md transition-all duration-300 font-medium shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[14px] md:text-[15px] font-black text-emerald-800/70 uppercase tracking-wider ml-1.5">{t('phone_number')}</label>
                        <div className="relative group">
                          <Phone className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-600 transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            required
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={customerDetails.phone}
                            onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl py-3.5 pl-12 pr-5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:shadow-md transition-all duration-300 font-medium shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[14px] md:text-[15px] font-black text-emerald-800/70 uppercase tracking-wider ml-1.5">{t('delivery_address')}</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4.5 top-4.5 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-600 transition-all duration-300 group-focus-within:scale-110" />
                          <textarea
                            required
                            rows={3}
                            placeholder={language === 'ta' ? "உங்கள் முழு முகவரியை இங்கே உள்ளிடவும்..." : "Enter your full address here..."}
                            value={customerDetails.place}
                            onChange={(e) => setCustomerDetails({ ...customerDetails, place: e.target.value })}
                            className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl py-3.5 pl-12 pr-5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:shadow-md transition-all duration-300 resize-none font-medium shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.015)]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-2xl text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="text-[8px] font-black text-emerald-200 uppercase tracking-widest mb-0.5">{t('total')}</div>
                        <div className="text-2xl font-black">₹{cartTotal.toLocaleString()}</div>
                      </div>
                      <div className="relative z-10 flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20 text-[9px] font-black uppercase tracking-widest">
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('cod_available')}</span>
                      </div>
                    </div>
                  </form>

                  <div className="p-5 bg-white border-t border-slate-100 sticky bottom-0 z-10">
                    <button
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                      className="w-full py-4 bg-emerald-800 text-white font-black rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-70 active:scale-98 uppercase tracking-widest text-xs cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('processing')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('confirm_order')}</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-white">
                  <div className="p-6 border-b border-emerald-900/10 flex justify-between items-center bg-emerald-100/70 sticky top-0 z-10">
                    <div>
                      <h2 className="text-xl font-black text-emerald-800 tracking-tight">{language === 'ta' ? 'வாடிக்கையாளர் கூடை' : 'Shopping cart'}</h2>
                      <p className="text-[10px] text-emerald-600/80 font-black uppercase tracking-widest mt-0.5">{cart.length} {t('items')}</p>
                    </div>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-9 h-9 rounded-full bg-white hover:bg-emerald-600 border border-emerald-900/10 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-sm cursor-pointer duration-300 hover:rotate-90 active:scale-95"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-24">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-black text-slate-900 tracking-tight">{t('cart_empty')}</p>
                          <p className="text-xs text-slate-400 font-semibold">{language === 'ta' ? 'நீங்கள் இன்னும் எதையும் சேர்க்கவில்லை.' : "You haven't added anything yet."}</p>
                        </div>
                        <button
                          onClick={() => setCartOpen(false)}
                          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs shadow-md uppercase tracking-widest transition-all"
                        >
                          {t('start_shopping')}
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <m.div
                          layout
                          key={item.id}
                          className="flex items-center bg-slate-100/70 hover:bg-slate-100 py-4 border-b border-slate-100/80 px-3 rounded-xl space-x-4 relative group transition-colors duration-300"
                        >
                          {/* Left Side: Product Image with light grey box */}
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 p-2 flex items-center justify-center transition-all duration-300 group-hover:scale-102">
                            <img
                              src={getOptimizedUrl(item.imageUrl)}
                              loading="lazy"
                              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-108"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Right Side: Info and Inline Counter */}
                          <div className="flex-1 flex flex-col justify-between py-1 relative">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-black text-emerald-800 text-[15px] md:text-[16px] line-clamp-1 tracking-tight pr-8">{item.name}</h4>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="absolute right-0 top-0 w-8 h-8 rounded-full bg-white hover:bg-emerald-600 border border-slate-200 shadow-sm flex items-center justify-center text-emerald-750 hover:text-white transition-all duration-300 hover:rotate-90 active:scale-90 cursor-pointer shadow-slate-200/40"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="font-bold text-slate-500 text-[13px] md:text-[14px] mt-1">₹{item.price.toLocaleString()}</p>
                            </div>

                            {/* Counter and item total price */}
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center space-x-3 bg-white rounded-lg p-0.5 border border-slate-200/80 shadow-sm w-[98px]">
                                <button
                                  onClick={() => {
                                    const step = isDecimalAllowed(item.unit) ? 0.1 : 1;
                                    updateCartQuantity(item.id, Math.max(step, item.quantity - step));
                                  }}
                                  className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-750 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-[13px] font-black text-slate-850 flex-1 text-center select-none">
                                  {isDecimalAllowed(item.unit) ? item.quantity.toFixed(1) : Math.round(item.quantity)}
                                </span>
                                <button
                                  onClick={() => {
                                    const step = isDecimalAllowed(item.unit) ? 0.1 : 1;
                                    updateCartQuantity(item.id, item.quantity + step);
                                  }}
                                  className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-750 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="font-black text-emerald-600 text-[16px] md:text-[17px]">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        </m.div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-wider">{language === 'ta' ? 'கூட்டுத்தொகை:' : 'Subtotal:'}</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold mb-6">{language === 'ta' ? 'வரிகள் மற்றும் டெலிவரி கட்டணம் செக்அவுட்டில் கணக்கிடப்படும்' : 'Taxes and shipping calculated at checkout'}</p>

                      {/* Premium twin buttons placed side-by-side */}
                      <div className="flex space-x-3.5">
                        <button
                          onClick={() => setIsCheckingOut(true)}
                          className="flex-1 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black flex items-center justify-center space-x-2 shadow-lg shadow-emerald-700/15 hover:shadow-emerald-700/25 transition-all active:scale-95 uppercase tracking-widest text-xs cursor-pointer"
                        >
                          <span>{t('checkout')}</span>
                        </button>
                        <button
                          onClick={() => setCartOpen(false)}
                          className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black flex items-center justify-center space-x-2 shadow-lg hover:shadow-slate-900/20 transition-all active:scale-95 uppercase tracking-widest text-xs cursor-pointer"
                        >
                          <span>{language === 'ta' ? 'தொடரவும்' : 'Continue'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Mobile Filter Sidebar Drawer Popup */}
      <MobileFilters
        products={products}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        availability={availability}
        setAvailability={setAvailability}
        organicFilter={organicFilter}
        setOrganicFilter={setOrganicFilter}
        language={language}
        t={t}
        isMobileFilterOpen={isMobileFilterOpen}
        setIsMobileFilterOpen={setIsMobileFilterOpen}
      />

      {/* 5. Quick View Overlay Modal */}
      <QuickViewModal
        quickViewProduct={quickViewProduct}
        setQuickViewProduct={setQuickViewProduct}
        language={language}
        t={t}
        addToCart={addToCart}
        setCartOpen={setCartOpen}
      />

      {/* 6. Product Detail Dynamic Modal */}
      <ProductDetailsModal
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        selectedWeight={selectedWeight}
        setSelectedWeight={setSelectedWeight}
        isDecimalAllowed={isDecimalAllowed}
        language={language}
        t={t}
        addToCart={addToCart}
        setCartOpen={setCartOpen}
      />

      {/* Full Screen Order Success Overlay */}
      <AnimatePresence>
        {isOrderPlaced && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-emerald-50/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <m.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-emerald-100 flex flex-col items-center"
            >
              <m.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1.1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-600/35"
              >
                <CheckCircle className="w-12 h-12" />
              </m.div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter uppercase">{t('order_placed')}</h2>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold mb-6 px-4">
                {t('order_success_desc')}
              </p>
              
              <div className="w-full bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50 text-left mb-6 space-y-2.5">
                <div className="text-xs font-black text-emerald-800 uppercase tracking-wider">{language === 'ta' ? 'விவரங்கள்' : 'Order Summary'}</div>
                <div className="text-xs text-slate-600 font-semibold"><span className="font-bold">{language === 'ta' ? 'பெயர்:' : 'Name:'}</span> {customerDetails.name}</div>
                <div className="text-xs text-slate-600 font-semibold"><span className="font-bold">{language === 'ta' ? 'தொலைபேசி:' : 'Phone:'}</span> {customerDetails.phone}</div>
                <div className="text-xs text-slate-600 font-semibold"><span className="font-bold">{language === 'ta' ? 'முகவரி:' : 'Address:'}</span> {customerDetails.place}</div>
                <div className="text-xs text-slate-600 font-semibold"><span className="font-bold">{language === 'ta' ? 'மொத்தம்:' : 'Total Price:'}</span> ₹{cartTotal.toLocaleString()}</div>
              </div>
              
              <div className="text-xs text-slate-400 font-bold animate-pulse flex items-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>{language === 'ta' ? 'வாட்ஸ்அப்பிற்கு திருப்பி விடப்படுகிறது...' : 'Redirecting to WhatsApp...'}</span>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
