import express from 'express';
import brandsController from '../../controllers/api/brands.controller.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', checkUserAuth, brandsController.getAll);

export default router;