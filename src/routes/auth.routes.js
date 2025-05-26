import { Router } from 'express';
// import passport from 'passport'; // Podrías quitarlo si no lo usas en otras partes
import { login, logout, refreshToken, getMe, authenticateToken } from '../controllers/auth.controller.js';

const router = Router();

// Ruta de Login (no requiere autenticación previa)
router.post('/login', login);

// Ruta de Logout (requiere que el usuario esté autenticado para cerrar su propia sesión)
router.get('/logout', authenticateToken, logout); // Usamos tu propio middleware para consistencia

// Ruta de Refresco de Token (no requiere autenticación de Access Token, solo de Refresh Token interno)
router.post('/refresh-token', refreshToken);

// Ruta para obtener datos del usuario (requiere autenticación de Access Token)
router.get('/me', authenticateToken, getMe);


export default router;