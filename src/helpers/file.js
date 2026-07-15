import { uploadFile } from "./cloudinary.js";
import db from "../database/models/index.js";
import sharp from "sharp";
const { File } = db;

const allowedFormats = ['jpeg', 'png', 'webp', 'avif', 'heif'];

const slugify = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// El public_id se arma solo con datos ya sanitizados (name/color/índice),
// nunca con el nombre del archivo original: evita romperse con nombres de
// producto que traen puntos, "+", paréntesis, etc.
export const handleModelFiles = async (files, frontendMetadata = [], { name, color }) => {
  try {
    const keys = [];
    const baseSlug = `${slugify(name)}-${slugify(color)}`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const meta = frontendMetadata[i];

      const publicId = `model/${baseSlug}-${i + 1}`;
      const storedPublicId = await uploadFile(file.buffer, publicId);

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
