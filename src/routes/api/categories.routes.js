import express from 'express';
import categoriesController from '../../controllers/api/categories.controller.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', checkUserAuth, categoriesController.getAll);

export default router;