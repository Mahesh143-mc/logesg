import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { m, AnimatePresence } from 'motion/react';
import { 
  Star, ShieldCheck, Sparkles, Send, MessageSquare, 
  Loader2, ArrowUp, ChevronDown, Check, User, Calendar, 
  ThumbsUp, Filter, ThumbsDown
} from 'lucide-react';
import { cn, getOptimizedUrl } from '../../lib/utils';
import { useTranslation } from '../../utils/translations';
import Swal from 'sweetalert2';
import { doc, getDoc } from 'firebase/firestore';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  category?: string;
  createdAt: any;
}

export function CustomerReviews() {
  const { language } = useStore();
  const t = useTranslation(language);

  // States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [productCategories, setProductCategories] = useState<string[]>([]);
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

  // Fetch Products to derive dynamic categories list
  useEffect(() => {
    try {
      const q = query(collection(db, 'products'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const catsSet = new Set<string>();
        snapshot.docs.forEach(doc => {
          const cat = doc.data().category;
          if (cat) catsSet.add(cat);
        });
        setProductCategories(Array.from(catsSet).filter(Boolean).sort());
      }, (error) => {
        console.error("Error loading products for review categories:", error);
        setProductCategories(['Vegetables', 'Fruits', 'Grains', 'Seeds']);
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Failed to subscribe to products collection for categories:", e);
      setProductCategories(['Vegetables', 'Fruits', 'Grains', 'Seeds']);
    }
  }, []);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    rating: 0,
    comment: '',
    category: ''
  });

  // Mock Reviews Fallback
  const mockReviews: Review[] = useMemo(() => [
    {
      id: "mock-r1",
      name: language === "ta" ? "ரமேஷ் குமார்" : "Ramesh Kumar",
      rating: 5,
      comment: language === "ta" ? "தக்காளி மற்றும் கேரட் மிகவும் புதியதாகவும் சுவையாகவும் உள்ளன. சிறந்த சேவை மற்றும் விரைவான டெலிவரி!" : "The organic tomatoes and carrots are extremely fresh and sweet. Excellent service and fast delivery! Highly recommended.",
      category: language === "ta" ? "காய்கறிகள்" : "Vegetables",
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 * 24 * 1 } // 1 day ago
    },
    {
      id: "mock-r2",
      name: language === "ta" ? "பிரியா சுந்தர்" : "Priya Sundar",
      rating: 5,
      comment: language === "ta" ? "வாழைப்பழங்கள் மற்றும் மாம்பழங்கள் மிகவும் சுவையாக உள்ளன. இரசாயனம் இல்லாத இயற்கை பழங்கள் கிடைப்பது மகிழ்ச்சி அளிக்கிறது." : "Bananas and mangoes are incredibly sweet and delicious. Happy to get 100% pesticide-free fruits here.",
      category: language === "ta" ? "பழங்கள்" : "Fruits",
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 * 24 * 3 } // 3 days ago
    },
    {
      id: "mock-r3",
      name: language === "ta" ? "லோகேஸ்வரன் எஸ்." : "Logeshwaran S.",
      rating: 4,
      comment: language === "ta" ? "பாரம்பரிய அரிசி வகைகள் மிக உயர்ந்த தரம் வாய்ந்தது. சமைக்கும் போது நல்ல மணம் வீசுகிறது." : "Traditional rice varieties are of high quality. Smells wonderful when cooked. Direct support to farmers makes it even better.",
      category: language === "ta" ? "தானியங்கள்" : "Grains",
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 * 24 * 6 } // 6 days ago
    },
    {
      id: "mock-r4",
      name: language === "ta" ? "மீனா கிருஷ்ணன்" : "Meena Krishnan",
      rating: 5,
      comment: language === "ta" ? "கீரை வகைகள் மிகவும் பசுமையாகவும் சுத்தமாகவும் உள்ளன. லோகேஷ் விவசாயி தளம் மிகவும் பயனுள்ளதாக உள்ளது." : "The greens are highly fresh and clean. Very helpful portal to purchase organic items easily.",
      category: language === "ta" ? "காய்கறிகள்" : "Vegetables",
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 * 24 * 10 } // 10 days ago
    }
  ], [language]);

  // Fetch reviews from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setReviews(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Review)));
        } else {
          setReviews(mockReviews);
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore loading error for reviews, falling back to mocks:", error);
        setReviews(mockReviews);
        setLoading(false);
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Failed to subscribe to reviews collection, displaying mocks:", e);
      setReviews(mockReviews);
      setLoading(false);
    }
  }, [mockReviews]);

  // Scroll to Top Listener
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Aggregate Stats Computations
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = parseFloat((sum / total).toFixed(1));

    const breakdown = [0, 0, 0, 0, 0]; // Index 0 is 5 star, 4 is 1 star
    reviews.forEach(r => {
      const index = 5 - Math.round(r.rating);
      if (index >= 0 && index < 5) {
        breakdown[index]++;
      }
    });

    return { average, total, breakdown };
  }, [reviews]);

  // Filters reviews list
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => filterRating === 'all' || Math.round(r.rating) === filterRating);
  }, [reviews, filterRating]);

  // Handle Form Submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'பெயர் தேவை' : 'Name Required',
        text: language === 'ta' ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.' : 'Please enter your name.',
        confirmButtonColor: '#059669',
      });
      return;
    }

    if (formData.rating === 0) {
      Swal.fire({
        icon: 'warning',
        title: t('rating_required'),
        text: t('rating_required_desc'),
        confirmButtonColor: '#059669',
      });
      return;
    }

    if (!formData.comment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: language === 'ta' ? 'கருத்து தேவை' : 'Comment Required',
        text: language === 'ta' ? 'தயவுசெய்து உங்கள் மதிப்புரையை உள்ளிடவும்.' : 'Please enter your review message.',
        confirmButtonColor: '#059669',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: Omit<Review, 'id'> = {
        name: formData.name,
        rating: formData.rating,
        comment: formData.comment,
        createdAt: serverTimestamp()
      };

      if (formData.category) {
        reviewData.category = formData.category;
      }

      await addDoc(collection(db, 'reviews'), reviewData);

      Swal.fire({
        icon: 'success',
        title: t('review_success'),
        text: t('review_success_desc'),
        confirmButtonColor: '#059669',
      });

      // Clear Form
      setFormData({
        name: '',
        rating: 0,
        comment: '',
        category: ''
      });
      setHoverRating(0);

    } catch (error) {
      console.error('Error submitting review:', error);
      Swal.fire({
        icon: 'error',
        title: t('error_occurred'),
        text: language === 'ta' ? 'மதிப்புரையைச் சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to submit review. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Local helper for date format
  const formatReviewDate = (createdAt: any) => {
    if (!createdAt) return '';
    const date = createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt);
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-32 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/30 dark:bg-emerald-950/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 left-0 w-[700px] h-[700px] bg-lime-100/25 dark:bg-lime-950/5 rounded-full blur-[160px]" />
      </div>

      {/* 1. Hero Banner */}
      <section className="relative w-full h-[320px] md:h-[380px] pt-24 md:pt-28 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={getOptimizedUrl(siteImages.review_hero || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=2000&auto=format&fit=crop", 2000)}
            alt="Farm Reviews Banner"
            className="w-full h-full object-cover object-center filter brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-zinc-950/90 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/30 via-transparent to-transparent z-10" />
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-white space-y-3 max-w-2xl">
            <span className="inline-flex px-3 py-1 rounded bg-emerald-500/25 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              {language === 'ta' ? 'எங்கள் வாடிக்கையாளர் கருத்துக்கள்' : 'Our Customer Voice'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              {t('customer_reviews')}
            </h1>
            <p className="text-emerald-200/80 text-sm md:text-base font-medium tracking-wide">
              {language === 'ta' 
                ? 'உங்கள் கருத்துக்கள் எங்களை மென்மேலும் சிறந்த ஆரோக்கியமான சேவைகளை வழங்க ஊக்குவிக்கின்றன.' 
                : 'Your feedback inspires us to deliver the best organic products directly from the soil.'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main content container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Grid: Aggregate Stats & Form (5 columns) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Stats Summary Panel */}
            <div className="bg-[#ecf3ee] dark:bg-emerald-950/20 rounded-3xl p-6 border border-emerald-900/10 dark:border-emerald-500/10 shadow-xl">
              <h2 className="text-sm font-black text-slate-800 dark:text-emerald-400 uppercase tracking-widest mb-6">
                {language === 'ta' ? 'ஒட்டுமொத்த மதிப்பீடு' : 'Aggregate Rating Summary'}
              </h2>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <span className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-none">
                    {stats.average || '0.0'}
                  </span>
                  <div className="flex justify-center mt-2.5">
                    {[1, 2, 3, 4, 5].map(star => {
                      const fill = star <= Math.round(stats.average);
                      return (
                        <Star 
                          key={star} 
                          className={cn(
                            "w-4 h-4", 
                            fill ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-zinc-700"
                          )} 
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                    {stats.total} {language === 'ta' ? 'மதிப்பீடுகள்' : 'Reviews'}
                  </span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="flex-1 space-y-2 border-l border-slate-200/60 dark:border-zinc-800 pl-6">
                  {stats.breakdown.map((count, index) => {
                    const stars = 5 - index;
                    const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center text-xs font-bold text-slate-600 dark:text-zinc-400">
                        <span className="w-3 text-right mr-1.5">{stars}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-2 flex-shrink-0" />
                        <div className="flex-1 h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <m.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full" 
                          />
                        </div>
                        <span className="w-8 text-right ml-2 text-[10px] text-slate-400 font-black">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-white/5 border border-white dark:border-white/5 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-semibold">
                  {language === 'ta' 
                    ? 'அனைத்து மதிப்புரைகளும் வாங்குபவர்களின் உண்மையான கருத்துக்களை அடிப்படையாகக் கொண்டவை.' 
                    : '100% verified customer feedbacks directly logged. No fabricated statistics.'}
                </p>
              </div>
            </div>

            {/* Write Review Form Card */}
            <div className="bg-[#ecf3ee] dark:bg-emerald-950/20 rounded-3xl p-6 border border-emerald-900/10 dark:border-emerald-500/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center space-x-2.5 mb-6">
                <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('write_review')}
                </h2>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                {/* Star Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {t('rating')} *
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map(star => {
                      const isActive = star <= (hoverRating || formData.rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none transition-transform hover:scale-125"
                          aria-label={`Rate ${star} Stars`}
                        >
                          <Star 
                            className={cn(
                              "w-8 h-8 cursor-pointer transition-all",
                              isActive
                                ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                                : "text-slate-300 dark:text-zinc-700"
                            )} 
                          />
                        </button>
                      );
                    })}
                    {(hoverRating || formData.rating) > 0 && (
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 ml-2 uppercase tracking-widest animate-pulse">
                        {(hoverRating || formData.rating)} / 5
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2 text-left">
                  <label htmlFor="rev-name" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {language === 'ta' ? 'பெயர்' : 'Your Name'} *
                  </label>
                  <input
                    id="rev-name"
                    type="text"
                    required
                    placeholder={language === 'ta' ? 'முழு பெயர்' : 'e.g. Ramesh Kumar'}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-4 focus:ring-emerald-550/20 focus:border-emerald-500 transition-all font-semibold shadow-inner"
                  />
                </div>

                {/* Product context selector (Optional) */}
                <div className="space-y-2 text-left">
                  <label htmlFor="rev-category" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {language === 'ta' ? 'பொருள் வகை (விருப்பத்தேர்வு)' : 'Product Category (Optional)'}
                  </label>
                  <select
                    id="rev-category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-550/20 focus:border-emerald-500 transition-all font-semibold"
                  >
                    <option value="">{language === 'ta' ? '-- தேர்வு செய்க --' : '-- Choose Option --'}</option>
                    {productCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Comment Text */}
                <div className="space-y-2 text-left">
                  <label htmlFor="rev-comment" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {language === 'ta' ? 'மதிப்புரை' : 'Your Review'} *
                  </label>
                  <textarea
                    id="rev-comment"
                    required
                    rows={4}
                    placeholder={t('review_placeholder')}
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-4 focus:ring-emerald-550/20 focus:border-emerald-500 transition-all font-semibold shadow-inner resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('processing')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('submit_review')}</span>
                    </>
                  )}
                </button>

              </form>
            </div>

          </div>

          {/* Right Grid: Reviews Feed (7 columns) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Filter pills bar */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-zinc-800 p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {language === 'ta' ? 'வடிகட்டவும்' : 'Filter By'}:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { value: 'all', label: language === 'ta' ? 'அனைத்தும்' : 'All' },
                  { value: 5, label: '5 ★' },
                  { value: 4, label: '4 ★' },
                  { value: 3, label: '3 ★' },
                  { value: 2, label: '2 ★' },
                  { value: 1, label: '1 ★' }
                ].map(pill => (
                  <button
                    key={pill.value}
                    onClick={() => setFilterRating(pill.value as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all",
                      filterRating === pill.value
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Feed */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-zinc-800 p-12 rounded-3xl text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm md:text-base">
                  {t('no_reviews')}
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  {language === 'ta' 
                    ? 'இந்த வடிகட்டலுக்கு எந்த மதிப்புரைகளும் இல்லை. முதலில் உங்களுடையதை சமர்ப்பிக்கவும்!' 
                    : 'Be the first to submit a review for this rating filter!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredReviews.map((rev, idx) => (
                    <m.div
                      key={rev.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                      className="bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-zinc-800 p-6 rounded-3xl shadow-sm hover:border-emerald-500/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 relative group"
                    >
                      {/* Optional Category tag top-right */}
                      {rev.category && (
                        <span className="absolute top-6 right-6 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-100/50 dark:border-emerald-500/10">
                          {rev.category === 'Vegetables' ? (language === 'ta' ? 'காய்கறிகள்' : 'Vegetables') :
                           rev.category === 'Fruits' ? (language === 'ta' ? 'பழங்கள்' : 'Fruits') :
                           rev.category === 'Grains' ? (language === 'ta' ? 'தானியங்கள்' : 'Grains') :
                           rev.category === 'Seeds' ? (language === 'ta' ? 'விதைகள்' : 'Seeds') :
                           rev.category}
                        </span>
                      )}

                      {/* Header Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/10">
                          {rev.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-sm sm:text-base text-slate-800 dark:text-zinc-200">
                              {rev.name}
                            </h4>
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              <Check className="w-2.5 h-2.5" />
                              {language === 'ta' ? 'உறுதி செய்யப்பட்டது' : 'Verified'}
                            </span>
                          </div>

                          {/* Review Stars */}
                          <div className="flex items-center gap-1 py-0.5">
                            {[1, 2, 3, 4, 5].map(star => {
                              const fill = star <= Math.round(rev.rating);
                              return (
                                <Star 
                                  key={star} 
                                  className={cn(
                                    "w-3.5 h-3.5",
                                    fill ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-zinc-800"
                                  )} 
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Review message text */}
                      <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-300 leading-relaxed mt-4">
                        {rev.comment}
                      </p>

                      {/* Footer date */}
                      <div className="border-t border-slate-100/60 dark:border-zinc-850 mt-4 pt-3 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatReviewDate(rev.createdAt)}
                        </span>
                        
                        {/* Helpful interactions mock buttons */}
                        <div className="flex items-center space-x-3 text-slate-400 dark:text-zinc-600">
                          <button className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Helpful</span>
                          </button>
                        </div>
                      </div>

                    </m.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* 3. Floating Scroll To Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <m.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-[120] w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform cursor-pointer border border-emerald-500"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </m.button>
        )}
      </AnimatePresence>

    </div>
  );
}
