import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getOptimizedUrl = (url?: string, width?: number) => {
  if (!url) return "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop";
  if (!url.includes('cloudinary')) return url;
  
  // If it already has f_auto, we could replace it or just let it be. But let's enforce our own transformation.
  // The simplest way to force it is to replace /upload/ or /upload/<existing_transforms>/ with our own.
  // Cloudinary URLs typically look like: https://res.cloudinary.com/demo/image/upload/v1234/image.jpg
  // Or with transforms: https://res.cloudinary.com/demo/image/upload/w_200/v1234/image.jpg
  
  // Strip out existing transformations after /upload/ and before /v
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  
  const versionIndex = url.indexOf('/v', uploadIndex + 8);
  const basePath = url.substring(0, uploadIndex + 8);
  const imagePath = versionIndex !== -1 ? url.substring(versionIndex) : url.substring(uploadIndex + 8);
  
  const optimizationParams = width ? `w_${width},f_auto,q_auto` : 'f_auto,q_auto';
  
  return `${basePath}${optimizationParams}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
