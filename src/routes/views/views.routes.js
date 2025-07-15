import express from 'express';
import viewsController from '../../controllers/views/views.controller.js';
const router = express.Router();

router.get('/inicio-sesion', viewsController.signIn);
router.get('/registro', viewsController.register);

export default router;