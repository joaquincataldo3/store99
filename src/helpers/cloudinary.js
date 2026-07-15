import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = 'store99';

export const uploadFile = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: FOLDER, resource_type: 'image', overwrite: true },
      (error, result) => (error ? reject(error) : resolve(result.public_id))
    ).end(buffer);
  });
};

export const deleteFilesFromCloudinary = async (files) => {
  for (const file of files) {
    if (!file.regular_filename) continue;
    try {
      await cloudinary.uploader.destroy(file.regular_filename);
    } catch (error) {
      console.log(`Error deleting ${file.regular_filename} from Cloudinary:`, error);
      return false;
    }
  }
  return true;
};

const KNOWN_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif|heif|gif)$/i;

export const getCloudinaryUrl = (publicId, { thumb = false } = {}) => {
  let normalizedId = publicId.replace(KNOWN_IMAGE_EXTENSIONS, '');
  if (!normalizedId.startsWith('store99/')) normalizedId = `store99/${normalizedId}`;
  return cloudinary.url(normalizedId, {
    width: thumb ? 600 : 1200,
    crop: 'scale',
    format: 'webp',
    quality: 'auto',
    secure: true,
  });
};
