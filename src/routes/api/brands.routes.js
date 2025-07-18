import express from 'express';
import brandsController from '../../controllers/api/brands.controller.js';
const router = express.Router();

router.get('/', brandsController.getAll);

export default router;