import { deleteFilesFromDbByShoeId, filterFiles, getFilesFromDbByShoeId, handleModelFiles, insertFilesInDb } from "../../helpers/file.js";
import { deleteModelById, findAllModels, findModelById, findModelByNameAndColor, insertModelInDb } from "../../helpers/model.js";
import { findBrandById } from "../../helpers/brand.js";
import { deleteFilesFromS3, getS3PublicUrl} from "../../helpers/aws.js";

const controller = {
    getAll: async (req, res) => {
        try {
            const models = await findAllModels();

            const enrichedModels = await Promise.all(models.map(async model => {
            const filesFromDb = await getFilesFromDbByShoeId(model.id);

            const filesWithUrls = await Promise.all(
                filesFromDb.map(async file => {
                    console.log(file.regular_filename)
                    console.log(file.thumb_filename)
                const regularUrl = await getS3PublicUrl(file.filename || file.regular_filename);
                const thumbUrl = file.main_file && file.thumb_filename
                    ? await getS3PublicUrl(file.thumb_filename)
                    : null;

                return {
                    key: regularUrl,
                    thumb: thumbUrl
                };
                })
            );

            return {
                ...model.dataValues, // si estás usando Sequelize
                files: filesWithUrls
            };
            }));

            return res.status(200).json({
            ok: true,
            msg: 'successfully retrieved all models',
            data: enrichedModels
            });
        } catch (error) {
            console.log('error obtaining all models');
            console.log(error);
            return res.status(500).json({
            msg: 'error obtaining all models',
            ok: false
            });
        }
    },
    create: async (req, res) => {
        try {
            let {name, color, brandId, filesMetadata} = req.body;
            filesMetadata = JSON.parse(filesMetadata);
            name = name.toLowerCase();
            color = color.toLowerCase();

            const multerFiles = req.files;
            const areInvalidFiles = filterFiles(multerFiles);

            if(areInvalidFiles){
                return res.status(400).json({
                    msg: 'invalid extension files',
                    ok: false
                })
            }

            const modelExists = await findModelByNameAndColor(name, color);
            if(modelExists === undefined){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            if(modelExists){
                return res.status(409).json({
                    msg: 'shoe already exists',
                    ok: false
                })
            }
            const brandExists = findBrandById(brandId);
            if(!brandExists) { 
                return res.status(400).json({
                    msg: "brand doesn't exist",
                    ok: false
                })
            }
            const newModelToCreate = {
                name,
                color,
                brandId
            }
            const modelInserted = await insertModelInDb(newModelToCreate);
            if(!modelInserted){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            
            const fileKeys = await handleModelFiles(multerFiles, filesMetadata);
            if(fileKeys === undefined){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            const areFilesInsertedInDb = await insertFilesInDb(fileKeys, modelInserted.id)
            if(!areFilesInsertedInDb){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            return res.status(201).json({
                ok: true,
                msg: 'shoe created successfully'
            })
        } catch (error) {
            console.log('error creating model');
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'internal server error'
            })
        }
        
    },
    delete: async (req, res) => {
        try {
            const {shoeId} = req.params;
            if (!shoeId || isNaN(Number(shoeId))) {
                return res.status(400).json({
                    msg: 'Invalid shoe id',
                    ok: false
                });
            }
            const shoeExists = await findModelById(shoeId);
            console.log(shoeExists)
            if(shoeExists === undefined){
                return res.status(500).json({
                    ok: false,
                    msg: 'internal server error'
                })
            }
            if(shoeExists === null){
                return res.status(404).json({
                    ok: false,
                    msg: 'shoe does not exist'
                })
            }
            const files = await getFilesFromDbByShoeId(shoeId);
            if(!files){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            const areFilesSuccessfullyDeletedFromAws = await deleteFilesFromS3(files);
            if(!areFilesSuccessfullyDeletedFromAws){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            const areFilesSuccessfullyDeletedFromDb = await deleteFilesFromDbByShoeId(shoeId);
            if(!areFilesSuccessfullyDeletedFromDb){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            await deleteModelById(shoeId)
            return res.status(200).json({
                ok: true,
                msg: 'shoe successfully deleted'
            })
        } catch (error) {
            console.log('error deleting shoe');
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'internal server error'
            })
        }
        
    }
}

export default controller;