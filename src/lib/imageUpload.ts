import imageCompression from 'browser-image-compression';
import CryptoJS from 'crypto-js';

const CLOUDINARY_CLOUD_NAME = 'dyaufjpai';
const CLOUDINARY_API_KEY = '692887168924367';
const CLOUDINARY_API_SECRET = 'FgZrRjQGM1wRldX_UBMErw1qyGU';

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.15,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/webp' as any
  };
  return await imageCompression(file, options);
};

export const uploadToCloudinary = (
  file: File, 
  onProgress?: (progress: number) => void,
  folderName: string = 'billing'
): Promise<{url: string, publicId: string}> => {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = CryptoJS.SHA1(`folder=${folderName}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`).toString();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folderName);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.secure_url, publicId: data.public_id });
        } else {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || 'Cloudinary upload failed'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.send(formData);
    } catch (err) {
      console.error('Upload function error:', err);
      reject(err);
    }
  });
};
