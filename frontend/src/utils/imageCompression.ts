import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export const compressImage = async (file: File): Promise<File> => {
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

export const uploadImageToStorage = async (file: File, path: string) => {
  // This will be implemented when we add the upload functionality
  // For now, just return a placeholder
  return `${path}/${file.name}`;
};