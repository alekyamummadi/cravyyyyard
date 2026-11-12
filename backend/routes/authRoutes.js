import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegisterInput } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegisterInput, register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
