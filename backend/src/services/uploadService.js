import { Readable } from 'stream';
import cloudinary from '../../config/cloudinary.js';

export const uploadBufferToCloudinary = (buffer, folder = 'carikos') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const uploadMultipleFiles = async (files, folder = 'carikos') => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) => uploadBufferToCloudinary(file.buffer, folder));
  const results = await Promise.all(uploadPromises);
  return results.map((result) => result.secure_url);
};
