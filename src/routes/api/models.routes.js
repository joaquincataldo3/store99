import express from 'express';
import modelsController from '../../controllers/api/models.controller.js';
import multerMiddleware from '../../middlewares/multer.middleware.js';
const router = express.Router();

router.get('/', modelsController.getAll)
router.post('/',  multerMiddleware.array('images'), modelsController.create);
router.delete('/:shoeId', modelsController.delete)

export default router;