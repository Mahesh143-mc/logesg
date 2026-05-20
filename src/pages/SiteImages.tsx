import React, { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImage, uploadToCloudinary } from '../lib/imageUpload';
import { Image as ImageIcon, Upload, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, getOptimizedUrl } from '../lib/utils';
import toast from 'react-hot-toast';

const IMAGE_SLOTS = [
  // Home Page
  { id: 'hero_1', label: 'Hero Slide 1', section: 'Home' },
  { id: 'hero_2', label: 'Hero Slide 2', section: 'Home' },
  { id: 'hero_3', label: 'Hero Slide 3', section: 'Home' },
  { id: 'hero_4', label: 'Hero Slide 4', section: 'Home' },
  { id: 'hero_5', label: 'Hero Slide 5', section: 'Home' },
  { id: 'hero_6', label: 'Hero Slide 6', section: 'Home' },
  { id: 'heritage_main', label: 'Heritage Main Image', section: 'Home' },
  { id: 'heritage_small_1', label: 'Heritage Small Image 1', section: 'Home' },
  { id: 'heritage_small_2', label: 'Heritage Small Image 2', section: 'Home' },
  { id: 'parallax_bg', label: 'Parallax Background', section: 'Home' },
  
  // About Page
  { id: 'about_hero', label: 'About Page Background', section: 'About' },
  { id: 'about_secondary', label: 'About Page Secondary Image', section: 'About' },
  
  // Product Page
  { id: 'shop_hero', label: 'Shop Page Background', section: 'Product' },
  
  // Contact Page
  { id: 'contact_hero', label: 'Contact Page Background', section: 'Contact' },
  
  // Review Page
  { id: 'review_hero', label: 'Review Page Background', section: 'Review' }
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
  parallax_bg: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1920&auto=format&fit=crop",
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
            <ImageIcon className="w-8 h-8 text-indigo-600" />
            Frontend Images
          </h1>
          <p className="text-slate-500 mt-1">Manage images displayed on the customer-facing website.</p>
        </div>
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
                        <p className="text-xs text-slate-500 mt-1">
                          {images[slot.id] ? 'Custom image' : 'Default Unsplash image'}
                        </p>
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
