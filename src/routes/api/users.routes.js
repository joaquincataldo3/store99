import express from 'express';
import usersController from '../../controllers/api/users.controller.js';
import registerValidations from '../../validators/form.validator.js';
import { checkUserAuth } from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/sign-in', usersController.signIn);
router.post('/register', registerValidations, usersController.register);

export default router;