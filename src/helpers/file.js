import { uploadFile } from "./aws";
import db from "../../database/models/index.js";
const { File } = db;

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const handleModelFiles = async (files) => {
    try {
        let keys = [];
        for (const file of files) {
            const compressedImage = await compressImage(file);
            const key = `model/${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}.jpg`;
            const fileKey = await uploadFile(compressedImage, key, 'image/jpeg');
            keys.push({key: fileKey, main_file: file.main_file});
        }
        return keys;
    } catch (error) {
        console.log('error handling model files')
        console.log(error)
        return undefined;
    }
 
}

export const insertFilesInDb = async (files, modelId) => {
    try {
        for(let i = 0; i < files.length; i++){
            const {key, main_file} = files[i]
            await File.create({
                filename: key,
                main_file,
                model_id: modelId
            })
        }
        return true;
    } catch (error) {
        console.log('error inserting files in db');
        console.log(error);
        return false;
    }
}

export const compressImage = async (file) => {
    return await sharp(file.path)
                    .resize({ width: 1200, withoutEnlargement: true }) 
                    .jpeg({ quality: 85, mozjpeg: true })
                    .toBuffer();
}

export const filterFiles = (files) => {
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.mimetype));
    return invalidFiles.length > 0
}

export const getFilesFromDbByShoeId = async (shoeId) => {
    try {
        const files = await File.findAll({
            where: {
                shoe_id: shoeId
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
                shoe_id: shoeId
            }
        })
        return true;
    } catch (error) {
        console.log('error')
        console.log(error)
        return false;
    }
}