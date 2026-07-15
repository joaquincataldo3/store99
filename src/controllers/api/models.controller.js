import { deleteFilesFromDbByShoeId, filterFiles, getFilesFromDbByShoeId, handleModelFiles, insertFilesInDb } from "../../helpers/file.js";
import { deleteModelById, findAllModelsByCategory, findLatest, findModelById, findModelByNameAndColor, insertModelInDb } from "../../helpers/model.js";
import { findBrandById } from "../../helpers/brand.js";
import { deleteFilesFromCloudinary, getCloudinaryUrl } from "../../helpers/cloudinary.js";
import { insertCategoriesWithModelId } from "../../helpers/category.js";
import { syncStockSizes } from "../../helpers/stock.js";
import db from "../../database/models/index.js";

const controller = {
    getAll: async (req, res) => {
        try {
            const {categoryId} = req.query;
    
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
                const regularUrl = getCloudinaryUrl(file.regular_filename);
                const thumbUrl = file.main_file
                    ? getCloudinaryUrl(file.regular_filename, { thumb: true })
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
                const regularUrl = getCloudinaryUrl(file.regular_filename);
                const thumbUrl = file.main_file
                    ? getCloudinaryUrl(file.regular_filename, { thumb: true })
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
            let {name, color, brandId, filesMetadata, categoryId, categories, available_for_order, sizeIds} = req.body;
            filesMetadata = JSON.parse(filesMetadata);
            name = name.toLowerCase();
            color = color.toLowerCase();

            const multerFiles = req.files;
            const areInvalidFiles = await filterFiles(multerFiles);

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
            const brandExists = await findBrandById(brandId);
            if(!brandExists) {
                return res.status(400).json({
                    msg: "brand doesn't exist",
                    ok: false
                })
            }

            // Subir a Cloudinary antes de escribir nada en la DB: si esto falla
            // no queda ningún registro huérfano (modelo sin imágenes).
            const fileKeys = await handleModelFiles(multerFiles, filesMetadata, { name, color });
            if(fileKeys === undefined){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }

            const transaction = await db.sequelize.transaction();
            try {
                const newModelToCreate = {
                    name,
                    color,
                    brandId,
                    categoryId,
                    available_for_order: available_for_order !== undefined ? Number(available_for_order) : 1
                }
                const modelInserted = await insertModelInDb(newModelToCreate, { transaction });
                if(!modelInserted){
                    throw new Error('failed to insert model');
                }

                if (categories) {
                    const categoryIds = Array.isArray(categories) ? categories : [categories];
                    const modelCategorySuccessfullyInserted = await insertCategoriesWithModelId(categoryIds, modelInserted.id, { transaction });
                    if(!modelCategorySuccessfullyInserted) {
                        throw new Error('failed to insert categories');
                    }
                }

                if (sizeIds) {
                    const sizeIdsArray = Array.isArray(sizeIds) ? sizeIds : [sizeIds];
                    await syncStockSizes(modelInserted.id, sizeIdsArray, { transaction });
                }

                const areFilesInsertedInDb = await insertFilesInDb(fileKeys, modelInserted.id, { transaction });
                if(!areFilesInsertedInDb){
                    throw new Error('failed to insert files');
                }

                await transaction.commit();

                return res.status(201).json({
                    ok: true,
                    msg: 'shoe created successfully'
                })
            } catch (transactionError) {
                await transaction.rollback();
                console.log('error creating model, rolled back');
                console.log(transactionError);
                // Las imágenes ya se subieron a Cloudinary antes de la transacción: limpiarlas
                // para no dejar archivos huérfanos allá tampoco.
                await deleteFilesFromCloudinary(fileKeys);
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
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
            const areFilesSuccessfullyDeletedFromAws = await deleteFilesFromCloudinary(files);
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
        
    },
    getLatest: async (req, res) => {
        try {
            const latestModels = await findLatest();
            const enrichedModels = await Promise.all(latestModels.map(async model => {
                const filesFromDb = await getFilesFromDbByShoeId(model.id);

                const filesWithUrls = await Promise.all(
                    filesFromDb.map(async file => {
                    const regularUrl = getCloudinaryUrl(file.regular_filename);
                    const thumbUrl = file.main_file
                        ? getCloudinaryUrl(file.regular_filename, { thumb: true })
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
                msg: 'successfully retrieved latest models',
                data: enrichedModels
            });
        } catch (error) {
            console.log('error obtaining latest models');
            console.log(error);
            return res.status(500).json({
                msg: 'error obtaining latest models',
                ok: false
            });
        }
    }
}

export default controller;