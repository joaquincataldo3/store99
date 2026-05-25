import express from 'express';
import stocksController from '../../controllers/api/stocks.controller.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', stocksController.getAllStocks);
router.get('/:modelId', checkUserAuth, stocksController.getStockByModel);
router.put('/:modelId', checkUserAuth, stocksController.editStockByModel);

export default router;