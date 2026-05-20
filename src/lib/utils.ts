import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getOptimizedUrl = (url?: string, width?: number) => {
  if (!url) return "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop";
  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('f_auto')) {
    const optimizationParams = width ? `f_auto,q_auto,w_${width}/` : 'f_auto,q_auto/';
    return url.replace('/upload/', `/upload/${optimizationParams}`);
  }
  return url;
};
