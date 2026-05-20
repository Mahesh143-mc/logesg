import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Search, 
  Trash2, 
  MessageSquare, 
  Calendar,
  Filter,
  Star,
  ShieldAlert,
  Loader2,
  Tag
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  category?: string;
  createdAt: any;
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  // Synchronize reviews from Firestore
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews for admin:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Compute aggregate statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = parseFloat((sum / total).toFixed(1));

    const breakdown = [0, 0, 0, 0, 0]; // Index 0: 5 stars, 4: 1 star
    reviews.forEach(r => {
      const idx = 5 - Math.round(r.rating);
      if (idx >= 0 && idx < 5) breakdown[idx]++;
    });

    return { average, total, breakdown };
  }, [reviews]);

  // Handle Review Delete
  const handleDeleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  // Filter reviews based on search text and selected rating filter
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesRating = filterRating === 'all' || Math.round(r.rating) === filterRating;
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        r.name.toLowerCase().includes(lowerSearch) ||
        r.comment.toLowerCase().includes(lowerSearch) ||
        (r.category || '').toLowerCase().includes(lowerSearch);
      return matchesRating && matchesSearch;
    });
  }, [reviews, filterRating, searchTerm]);

  // Format timestamp helper
  const formatReviewDate = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    const date = createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header section */}
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reviews</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">Moderate customer feedback and review portal entries</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, comment, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Aggregate Stats Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1: Summary score */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl p-6 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Rating</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                {stats.average || '0.0'}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={cn(
                    "w-4 h-4", 
                    star <= Math.round(stats.average) ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-zinc-800"
                  )} 
                />
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        {/* Metric Card 2: Count */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl p-6 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Feedbacks</span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-none">
              {stats.total}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-2">Verified organic customer reviews</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Metric Card 3: Distribution Breakdown */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl p-5 border border-slate-200/60 dark:border-zinc-800 shadow-sm flex flex-col justify-center space-y-1.5">
          {stats.breakdown.map((count, index) => {
            const starNum = 5 - index;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={starNum} className="flex items-center text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                <span className="w-3 text-right mr-1.5">{starNum}</span>
                <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-2 flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-full transition-all duration-500" 
                  />
                </div>
                <span className="w-6 text-right ml-2 text-slate-400 font-bold">{count}</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Filter Options toolbar */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Rating Filter:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { value: 'all', label: 'All Reviews' },
            { value: 5, label: '5 Stars ★' },
            { value: 4, label: '4 Stars ★' },
            { value: 3, label: '3 Stars ★' },
            { value: 2, label: '2 Stars ★' },
            { value: 1, label: '1 Star ★' }
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilterRating(btn.value as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer",
                filterRating === btn.value
                  ? "bg-indigo-650 dark:bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:text-zinc-300"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-zinc-800 p-16 rounded-2xl text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-350 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-base">No matching reviews found</h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto">
            {searchTerm || filterRating !== 'all' 
              ? "Try adjusting your search criteria or rating filters to find what you are looking for." 
              : "Customers have not submitted any reviews yet. Submissions will populate here automatically."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div 
              key={rev.id} 
              className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#18181b] shadow-sm border border-slate-200/60 dark:border-zinc-800 p-6 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-300"
            >
              {/* Top Row: Reviewer Details */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-450 flex items-center justify-center font-bold text-sm border border-indigo-500/10">
                    {rev.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-150 leading-tight">
                      {rev.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={cn(
                              "w-3 h-3", 
                              star <= Math.round(rev.rating) ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-zinc-800"
                            )} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">({rev.rating}/5)</span>
                    </div>
                  </div>
                </div>

                {/* Trash Deletion Button */}
                <button
                  onClick={() => setIdToDelete(rev.id)}
                  aria-label="Delete review"
                  className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-500/15 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Review Comments */}
              <div className="mt-4 flex-1">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {rev.comment}
                </p>
              </div>

              {/* Footer Date & Category tag */}
              <div className="border-t border-slate-100 dark:border-zinc-850 mt-5 pt-3.5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatReviewDate(rev.createdAt)}</span>
                </div>

                {rev.category && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-800 text-[9px] font-black text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-800/80">
                    <Tag className="w-2.5 h-2.5" />
                    {rev.category}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {idToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100 dark:border-zinc-850 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 mx-auto border border-red-500/10">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Delete Review?</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Are you sure you want to delete this customer review? This entry will be permanently removed from both the Admin portal and customer reviews board.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIdToDelete(null)}
                className="flex-1 py-2.5 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteReview(idToDelete);
                  setIdToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-xs font-black uppercase tracking-wider text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/15"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
