import express from 'express';
import filesController from '../../controllers/api/files.controller.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/multer.middleware.js';
const router = express.Router();

router.post('/forma-comprar', checkUserAuth, upload.single('pdf'), filesController.replaceFormaComprar);

export default router;
