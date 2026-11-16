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

/**
 * Extract the Cloudinary public_id from a standard Cloudinary delivery URL.
 */
export const extractCloudinaryPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('res.cloudinary.com')) return null;

  const match = url.match(/\/(?:image|raw|video)\/upload\/(?:v\d+\/)?([^?#]+)$/);
  if (!match || !match[1]) return null;

  const withoutExtension = match[1].replace(/\.[^./]+$/, '');
  try {
    return decodeURIComponent(withoutExtension);
  } catch {
    return withoutExtension;
  }
};

/**
 * Best-effort cleanup of uploaded Cloudinary images; ignores non-Cloudinary URLs
 * or unconfigured Cloudinary credentials so DB cleanup never aborts.
 */
export const deleteCloudinaryImages = async (urls = []) => {
  const publicIds = [
    ...new Set((urls || []).map(extractCloudinaryPublicId).filter(Boolean)),
  ];
  if (publicIds.length === 0) return [];

  if (
    !process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    !process.env.CLOUDINARY_API_KEY?.trim() ||
    !process.env.CLOUDINARY_API_SECRET?.trim() ||
    typeof cloudinary?.uploader?.destroy !== 'function'
  ) {
    return [];
  }

  return await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
  );
};
