import express from 'express';
import sizesController from '../../controllers/api/sizes.controller.js';
const router = express.Router();

router.get('/', sizesController.getAll);

export default router;