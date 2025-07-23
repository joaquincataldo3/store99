import { deleteFilesFromDbByShoeId, filterFiles, getFilesFromDbByShoeId, handleModelFiles, insertFilesInDb } from "../../helpers/file.js";
import { deleteModelById, findAllModelsByCategory, findModelById, findModelByNameAndColor, insertModelInDb } from "../../helpers/model.js";
import { findBrandById } from "../../helpers/brand.js";
import { deleteFilesFromS3, getS3PublicUrl} from "../../helpers/aws.js";
import { insertCategoriesWithModelId } from "../../helpers/category.js";

const controller = {
    getAll: async (req, res) => {
        try {
            const {categoryId} = req.query;
            console.log(categoryId)
            if(!categoryId && Number(categoryId) !== 2 && Number(categoryId) !== 1){
                return res.status(400).json({
                    ok: false,
                    msg:'invalid category id'
                })
            }
            const modelsCategory = await findAllModelsByCategory(categoryId);

            const enrichedModels = await Promise.all(modelsCategory.map(async modelCategory => {
               const {model} = modelCategory;
            const filesFromDb = await getFilesFromDbByShoeId(model.id);

            const filesWithUrls = await Promise.all(
                filesFromDb.map(async file => {
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
                ...model.dataValues, 
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
    getOne: async (req, res) => {
        try {
            const { modelId } = req.params;
            if (!modelId || isNaN(modelId)) {
            return res.status(400).json({
                ok: false,
                msg: 'Invalid model ID',
            });
            }

            // Traer model + relaciones necesarias
            const dbModel = await findModelById(modelId); // Una función similar a findAllModelsByCategory pero con findOne

            if (!dbModel) {
            return res.status(404).json({
                ok: false,
                msg: 'Model not found',
            });
            }

            const model = dbModel;

            const filesFromDb = await getFilesFromDbByShoeId(model.id);

            const filesWithUrls = await Promise.all(
            filesFromDb.map(async (file) => {
                const regularUrl = await getS3PublicUrl(file.filename || file.regular_filename);
                const thumbUrl =
                file.main_file && file.thumb_filename
                    ? await getS3PublicUrl(file.thumb_filename)
                    : null;

                return {
                key: regularUrl,
                thumb: thumbUrl,
                main_file: file.main_file
                };
            })
            );
            filesWithUrls.sort((a, b) => (b.main_file || 0) - (a.main_file || 0));


            const enrichedModel = {
            ...model.dataValues,
            files: filesWithUrls,
            };

            return res.status(200).json({
            ok: true,
            msg: 'Successfully retrieved model',
            data: enrichedModel,
            });
        } catch (error) {
            console.log('error obtaining model by id');
            console.log(error);
            return res.status(500).json({
            ok: false,
            msg: 'Internal server error',
            });
        }
    },
    create: async (req, res) => {
        try {
            let {name, color, brandId, filesMetadata, categoryId, categories} = req.body;
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
                brandId,
                categoryId
            }
            const modelInserted = await insertModelInDb(newModelToCreate);
            if(!modelInserted){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            const categoryIds = Array.isArray(categories) ? categories : [categories];
            const modelCategorySuccessfullyInserted = await insertCategoriesWithModelId(categoryIds, modelInserted.id);
            if(!modelCategorySuccessfullyInserted) {
                await deleteModelById(modelInserted.id);
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