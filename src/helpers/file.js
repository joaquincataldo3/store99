import { uploadFile } from "./cloudinary.js";
import db from "../database/models/index.js";
import sharp from "sharp";
const { File } = db;

const allowedFormats = ['jpeg', 'png', 'webp', 'avif', 'heif'];

export const handleModelFiles = async (files, frontendMetadata = []) => {
  try {
    const keys = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const meta = frontendMetadata[i];

      // Strip extension — Cloudinary uses public_id without extension
      const publicId = meta.filename.replace(/\.[^/.]+$/, '');
      const storedPublicId = await uploadFile(file.buffer, publicId);
      console.log('uploaded')
      console.log(storedPublicId)

      keys.push({
        regular_filename: storedPublicId,
        thumb_filename: null,
        main_file: meta.main_file,
      });
    }

    return keys;
  } catch (error) {
    console.log('error handling model files');
    console.log(error);
    return undefined;
  }
};

export const insertFilesInDb = async (files, modelId, options = {}) => {
  try {
    for (let i = 0; i < files.length; i++) {
      const { regular_filename, thumb_filename, main_file } = files[i];

      await File.create({
        regular_filename,
        thumb_filename: thumb_filename || null,
        main_file,
        model_id: modelId
      }, options);
    }
    return true;
  } catch (error) {
    console.log('error inserting files in db');
    console.log(error);
    return false;
  }
};

export const filterFiles = async (files) => {
  for (const file of files) {
    try {
      const { format } = await sharp(file.buffer).metadata();
      if (!allowedFormats.includes(format)) return true;
    } catch {
      return true;
    }
  }
  return false;
};

export const getFilesFromDbByShoeId = async (shoeId) => {
  try {
    const files = await File.findAll({
      where: { model_id: shoeId }
    });
    return files;
  } catch (error) {
    console.log('error obtaining files');
    return null;
  }
};

export const deleteFilesFromDbByShoeId = async (shoeId) => {
  try {
    await File.destroy({
      where: { model_id: shoeId }
    });
    return true;
  } catch (error) {
    console.log('error');
    console.log(error);
    return false;
  }
};
