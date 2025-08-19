import { uploadFile } from "./aws.js";
import db from "../database/models/index.js";
import sharp from "sharp";
const { File } = db;

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const handleModelFiles = async (files, frontendMetadata = []) => {
  try {
    const keys = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const meta = frontendMetadata[i];

      // Comprimir imagen principal (grande)
      const compressedImage = await compressImage(file);
      const key = meta.filename;
      const fileKey = await uploadFile(compressedImage, key, 'image/webp');

      const fileEntry = {
        regular_filename: fileKey,
        main_file: meta.main_file
      };

      // Si es la imagen principal, generar thumb
      if (meta.main_file) {
        const thumbKey = key.replace(/(\.jpg|\.jpeg|\.png)$/i, '_thumb$1');
        const thumbImage = await compressImage(file, 600); 
        const thumbFileKey = await uploadFile(thumbImage, thumbKey, 'image/webp');
        fileEntry.thumb_filename = thumbFileKey;
      }

      keys.push(fileEntry);
    }

    return keys;
  } catch (error) {
    console.log('error handling model files');
    console.log(error);
    return undefined;
  }
};

export const insertFilesInDb = async (files, modelId) => {
  try {
    for (let i = 0; i < files.length; i++) {
      const { regular_filename, thumb_filename, main_file } = files[i];

      await File.create({
        regular_filename,
        thumb_filename: thumb_filename || null,
        main_file,
        model_id: modelId
      });
    }
    return true;
  } catch (error) {
    console.log('error inserting files in db');
    console.log(error);
    return false;
  }
};


export const compressImage = async (file, width = 1200) => {
  if (!file || !file.buffer) {
    throw new Error('Invalid file buffer');
  }

  return await sharp(file.buffer)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
};


export const filterFiles = (files) => {
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.mimetype));
    return invalidFiles.length > 0
}

export const getFilesFromDbByShoeId = async (shoeId) => {
    try {
        const files = await File.findAll({
            where: {
                model_id: shoeId
            }
        })

        return files;
    } catch (error) {
        console.log('error obtaining files');
        return null;
    }
}

export const deleteFilesFromDbByShoeId = async (shoeId) => {
    try {
        await File.destroy({
            where: {
                model_id: shoeId
            }
        })
        return true;
    } catch (error) {
        console.log('error')
        console.log(error)
        return false;
    }
}

