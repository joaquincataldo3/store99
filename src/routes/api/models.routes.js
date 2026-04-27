import express from 'express';
import modelsController from '../../controllers/api/models.controller.js';
import multerMiddleware from '../../middlewares/multer.middleware.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/category', modelsController.getAll);
router.get('/latest', modelsController.getLatest);
router.get('/:modelId', modelsController.getOne);

router.post('/', checkUserAuth, multerMiddleware.array('images'), modelsController.create);
router.delete('/:shoeId', checkUserAuth, modelsController.delete);

export default router;