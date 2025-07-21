import express from 'express';
import categoriesController from '../../controllers/api/categories.controller.js';
const router = express.Router();

router.get('/', categoriesController.getAll);

export default router;