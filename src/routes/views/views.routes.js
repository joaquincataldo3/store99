import express from 'express';
import viewsController from '../../controllers/views/views.controller.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/', viewsController.home);
router.get('/inicio-sesion', viewsController.signIn);
router.get('/registro', checkUserAuth, viewsController.register);
router.get('/crear-modelo', checkUserAuth, viewsController.createModel);
router.get('/zapatillas-encargue', viewsController.modelsList);
router.get('/modelo/:shoeId', viewsController.modelDetail);
router.get('/editar-stock', checkUserAuth, viewsController.editStock);
router.get('/zapatillas-stock', viewsController.modelsStock);

export default router;