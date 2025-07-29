import { findAll, findStockByModel, syncStockSizes } from "../../helpers/stock.js";
import { getFilesFromDbByShoeId } from "../../helpers/file.js";
import { getS3PublicUrl } from "../../helpers/aws.js";

const controller = {
    getStockByModel: async (req, res) => {
        try {
            const {modelId} = req.params;
            if(!modelId && !NaN(modelId)){
                return res.status(400).json({
                    ok: false,
                    msg: 'invalid model id'
                })
            }
            const stock = await findStockByModel(modelId);
            return res.status(200).json({
                ok: true,
                msg: 'successfully retrieved stock by model',
                data: stock
            })
        } catch (error) {
            console.log('error getting stock by model');
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'internal server error'
            })
        }
    },
    getAllStocks: async (req, res) => {
        try {
            const stock = await findAll(); 

          
            const modelMap = new Map();

            stock.forEach(entry => {
                if (!modelMap.has(entry.model.id)) {
                    modelMap.set(entry.model.id, entry.model);
                }
            });

            const enrichedModelsMap = new Map();

            await Promise.all(
            Array.from(modelMap.entries()).map(async ([id, model]) => {
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
                const clonedModel = {
                    ...model.get({ plain: true }),  
                    files: filesWithUrls
                };
                enrichedModelsMap.set(id, clonedModel);
                
                })
            );

            const finalStock = stock.map(entry => ({
                id: entry.id,
                size: entry.size,
                model: enrichedModelsMap.get(entry.model.id)
            }))
            return res.status(200).json({
                ok: true,
                msg: 'successfully retrieved all stock',
                data: finalStock
            })
        } catch (error) {
            console.log('error getting stock by model');
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'internal server error'
            })
        }
    },
    editStockByModel: async (req, res) => {
        try {
            const modelId = req.params.modelId;
            const newSizeIds = req.body.sizeIds; // array de size_id

            if (!Array.isArray(newSizeIds)) {
            return res.status(400).json({ msg: "sizeIds must be an array" });
            }

            await syncStockSizes(modelId, newSizeIds)
            return res.status(200).json({ ok: true, msg: "Stock updated successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, msg: "Internal server error" });
        }
    }
};

export default controller;