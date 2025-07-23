import { findAll, findStockByModel, syncStockSizes } from "../../helpers/stock.js";

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
            return res.status(200).json({
                ok: true,
                msg: 'successfully retrieved all stock',
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