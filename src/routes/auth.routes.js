import { Router } from 'express';
// import passport from 'passport'; // Podrías quitarlo si no lo usas en otras partes
import { login, logout, refreshToken, getMe, authenticateToken } from '../controllers/auth.controller.js';

const router = Router();


router.post('/login', login);

router.post('/logout', logout);

router.post('/refresh-token', refreshToken);

router.get('/me', authenticateToken, getMe);


export default router;