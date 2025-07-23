import express from 'express';
import viewsController from '../../controllers/views/views.controller.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/inicio-sesion', viewsController.signIn);
router.get('/registro', viewsController.register);
router.get('/crear-modelo', checkUserAuth, viewsController.createModel);
router.get('/zapatillas-encargue', viewsController.modelsList);
router.get('/modelo/:shoeId', viewsController.modelDetail);
router.get('/editar-stock', viewsController.editStock);

export default router;