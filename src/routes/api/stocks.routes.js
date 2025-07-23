import express from 'express';
import stocksController from '../../controllers/api/stocks.controller.js';
const router = express.Router();

router.get('/', stocksController.getAllStocks);
router.get('/:modelId', stocksController.getStockByModel);
router.put('/:modelId', stocksController.editStockByModel);

export default router;