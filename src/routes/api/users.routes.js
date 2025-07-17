import express from 'express';
import usersController from '../../controllers/api/users.controller.js';
import registerValidations from '../../validators/form.validator.js';
const router = express.Router();

router.post('/register', registerValidations, usersController.register);
router.post('/sign-in', usersController.signIn);

export default router;