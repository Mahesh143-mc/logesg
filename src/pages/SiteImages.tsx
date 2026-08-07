import React, { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImage, uploadToCloudinary } from '../lib/imageUpload';
import { Image as ImageIcon, Upload, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, getOptimizedUrl } from '../lib/utils';
import toast from 'react-hot-toast';

const IMAGE_SLOTS = [
  // Home Page
  { id: 'hero_1', label: 'Hero Slide 1', section: 'Home', recommendedSize: '1920 x 1080px' },
  { id: 'hero_2', label: 'Hero Slide 2', section: 'Home', recommendedSize: '1920 x 1080px' },
  { id: 'hero_3', label: 'Hero Slide 3', section: 'Home', recommendedSize: '1920 x 1080px' },
  { id: 'hero_4', label: 'Hero Slide 4', section: 'Home', recommendedSize: '1920 x 1080px' },
  { id: 'hero_5', label: 'Hero Slide 5', section: 'Home', recommendedSize: '1920 x 1080px' },
  { id: 'hero_6', label: 'Hero Slide 6', section: 'Home', recommendedSize: '1920 x 1080px' },
  { id: 'heritage_main', label: 'Heritage Main Image', section: 'Home', recommendedSize: '1200 x 800px' },
  { id: 'heritage_small_1', label: 'Heritage Small Image 1', section: 'Home', recommendedSize: '1000 x 1000px' },
  { id: 'heritage_small_2', label: 'Heritage Small Image 2', section: 'Home', recommendedSize: '1000 x 1000px' },
  { id: 'rate_card', label: 'Main Rate Card Image', section: 'Home', recommendedSize: '1200 x 1600px' },
  { id: 'parallax_bg', label: 'Parallax Background', section: 'Home', recommendedSize: '1920 x 1080px' },
  { id: 'special_offer', label: 'Special Offer Banner', section: 'Home', recommendedSize: '800 x 800px' },
  
  // About Page
  { id: 'about_hero', label: 'About Page Background', section: 'About', recommendedSize: '1920 x 1080px' },
  { id: 'about_secondary', label: 'About Page Secondary Image', section: 'About', recommendedSize: '1920 x 1080px' },
  
  // Product Page
  { id: 'shop_hero', label: 'Shop Page Background', section: 'Product', recommendedSize: '1920 x 1080px' },
  
  // Contact Page
  { id: 'contact_hero', label: 'Contact Page Background', section: 'Contact', recommendedSize: '1920 x 1080px' },
  
  // Review Page
  { id: 'review_hero', label: 'Review Page Background', section: 'Review', recommendedSize: '1920 x 1080px' }
];

const DEFAULT_IMAGES: Record<string, string> = {
  hero_1: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop",
  hero_2: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1600&auto=format&fit=crop",
  hero_3: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=1600&auto=format&fit=crop",
  hero_4: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1600&auto=format&fit=crop",
  hero_5: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1600&auto=format&fit=crop",
  hero_6: "https://images.unsplash.com/photo-1530906358829-e84b2769270f?q=80&w=1600&auto=format&fit=crop",
  heritage_main: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
  heritage_small_1: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop",
  heritage_small_2: "https://images.unsplash.com/photo-1500937386664-56d159437b7f?q=80&w=1000&auto=format&fit=crop",
  rate_card: "https://res.cloudinary.com/dyaufjpai/image/upload/v1786081739/rate_hsae5v.jpg",
  parallax_bg: "https://images.unsplash.com/photo-1500937386664-56d159437b7f?q=80&w=1920&auto=format&fit=crop",
  special_offer: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
  about_hero: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop",
  about_secondary: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop",
  shop_hero: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop",
  contact_hero: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2000&auto=format&fit=crop",
  review_hero: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=2000&auto=format&fit=crop"
};

export function SiteImages() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string>('Home');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const docRef = doc(db, 'siteSettings', 'frontendImages');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setImages(docSnap.data());
      } else {
        setImages({});
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (slotId: string, file: File) => {
    try {
      setUploadingSlot(slotId);
      setUploadProgress(0);

      const compressedFile = await compressImage(file);
      const result = await uploadToCloudinary(compressedFile, (progress) => {
        setUploadProgress(progress);
      }, 'frontend');

      const newImageUrl = result.url;
      const newImagesState = { ...images, [slotId]: newImageUrl };

      await setDoc(doc(db, 'siteSettings', 'frontendImages'), newImagesState, { merge: true });
      
      setImages(newImagesState);
      toast.success("Image updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingSlot(null);
      setUploadProgress(0);
    }
  };

  const onFileSelect = (slotId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(slotId, file);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Group slots by section
  const groupedSlots = IMAGE_SLOTS.reduce((acc, slot) => {
    if (!acc[slot.section]) {
      acc[slot.section] = [];
    }
    acc[slot.section].push(slot);
    return acc;
  }, {} as Record<string, typeof IMAGE_SLOTS>);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-emerald-600" />
            Frontend Images
          </h1>
          <p className="text-slate-500 mt-1">Manage images displayed on the customer-facing website.</p>
        </div>
      </div>

      {/* Featured Card: Main Home Rate Card Image Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>Main Home Image</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Main Home Rate Card Image (விலைப்பட்டியல்)
            </h2>
          </div>

          {/* Rate Card Image Preview & Upload Button */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-28 h-20 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 relative shrink-0">
              <img 
                src={images['rate_card'] ? getOptimizedUrl(images['rate_card'], 600) : DEFAULT_IMAGES['rate_card']}
                alt="Main Rate Card Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <label className="cursor-pointer px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                <Upload className="w-4 h-4" />
                <span>Upload New Rate Card</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => onFileSelect('rate_card', e)}
                  disabled={uploadingSlot === 'rate_card'}
                />
              </label>

              {images['rate_card'] && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold justify-center sm:justify-start">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Custom Rate Card Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {uploadingSlot === 'rate_card' && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-2">
            <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Uploading Rate Card Image...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSlots).map(([section, slots]) => {
          const isExpanded = expandedSection === section;
          return (
            <div key={section} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? '' : section)}
                className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {section} Page
                </h2>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
              </button>
              
              {isExpanded && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-700">
                  {slots.map((slot) => (
                    <div key={slot.id} className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img 
                          src={images[slot.id] ? getOptimizedUrl(images[slot.id], 800) : DEFAULT_IMAGES[slot.id]} 
                          alt={slot.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Replace Image
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => onFileSelect(slot.id, e)}
                              disabled={uploadingSlot === slot.id}
                            />
                          </label>
                        </div>

                        {uploadingSlot === slot.id && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-400" />
                            <span className="font-medium text-sm">Uploading {Math.round(uploadProgress)}%</span>
                            <div className="w-3/4 bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
                              <div 
                                className="bg-indigo-400 h-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-slate-800 dark:text-slate-200">{slot.label}</h3>
                          {images[slot.id] && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" title="Custom image uploaded" />
                          )}
                        </div>
                        <div className="flex flex-col mt-1">
                          <span className="text-xs text-slate-500">
                            {images[slot.id] ? 'Custom image' : 'Default Unsplash image'}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded w-fit">
                            Size: {slot.recommendedSize}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
