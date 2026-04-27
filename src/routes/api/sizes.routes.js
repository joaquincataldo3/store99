import express from 'express';
import sizesController from '../../controllers/api/sizes.controller.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', checkUserAuth, sizesController.getAll);

export default router;