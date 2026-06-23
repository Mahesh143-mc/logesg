import React, { useState, useEffect, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImage, uploadToCloudinary } from '../lib/imageUpload';
import { Image as ImageIcon, Upload, Loader2, Save } from 'lucide-react';
import { cn, getOptimizedUrl } from '../lib/utils';
import toast from 'react-hot-toast';

interface BannerData {
  image: string;
  title: string;
  subtitle: string;
  titleEn: string;
  subtitleEn: string;
}

const defaultBanners: BannerData[] = [
  { image: '', title: '', subtitle: '', titleEn: '', subtitleEn: '' },
  { image: '', title: '', subtitle: '', titleEn: '', subtitleEn: '' },
  { image: '', title: '', subtitle: '', titleEn: '', subtitleEn: '' }
];

export function FeaturedBanners() {
  const [banners, setBanners] = useState<BannerData[]>(defaultBanners);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const docRef = doc(db, 'siteSettings', 'featuredBanners');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().banners) {
        setBanners(docSnap.data().banners);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (index: number, file: File) => {
    try {
      setUploadingSlot(index);
      const compressedFile = await compressImage(file);
      const result = await uploadToCloudinary(compressedFile, undefined, 'frontend');

      const newBanners = [...banners];
      newBanners[index].image = result.url;
      setBanners(newBanners);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingSlot(null);
    }
  };

  const onFileSelect = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(index, file);
    }
  };

  const handleTextChange = (index: number, field: keyof BannerData, value: string) => {
    const newBanners = [...banners];
    newBanners[index][field] = value as string;
    setBanners(newBanners);
  };

  const saveBanners = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteSettings', 'featuredBanners'), { banners });
      toast.success("Banners saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save banners");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-indigo-600" />
            Featured Banners
          </h1>
          <p className="text-slate-500 mt-1">Manage the 3-image banner section displayed on the home page.</p>
        </div>
        <button
          onClick={saveBanners}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {banners.map((banner, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Banner {index + 1}</span>
            </div>
            
            <div className="p-5 flex-1 flex flex-col space-y-4">
              {/* Image Upload */}
              <div className="relative group rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                {banner.image ? (
                  <>
                    <img
                      src={getOptimizedUrl(banner.image, 400)}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-slate-50">
                        {uploadingSlot === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploadingSlot === index ? 'Uploading...' : 'Change Image'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => onFileSelect(index, e)}
                          disabled={uploadingSlot === index}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {uploadingSlot === index ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="text-sm font-medium">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Click to upload image</span>
                        <span className="text-xs text-slate-500 mt-1">Recommended: 800x800px</span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onFileSelect(index, e)}
                      disabled={uploadingSlot === index}
                    />
                  </label>
                )}
              </div>

              {/* Text Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Title (Tamil)</label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) => handleTextChange(index, 'title', e.target.value)}
                    placeholder="எ.கா: சுத்தமான மசாலா"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Subtitle (Tamil)</label>
                  <input
                    type="text"
                    value={banner.subtitle}
                    onChange={(e) => handleTextChange(index, 'subtitle', e.target.value)}
                    placeholder="எ.கா: இயற்கையான முறையில்"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Title (English)</label>
                  <input
                    type="text"
                    value={banner.titleEn}
                    onChange={(e) => handleTextChange(index, 'titleEn', e.target.value)}
                    placeholder="e.g: Pure Spices"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Subtitle (English)</label>
                  <input
                    type="text"
                    value={banner.subtitleEn}
                    onChange={(e) => handleTextChange(index, 'subtitleEn', e.target.value)}
                    placeholder="e.g: Naturally Processed"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
