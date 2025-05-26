import { Router } from 'express';
// import passport from 'passport'; // Podrías quitarlo si no lo usas en otras partes
import { login, logout, refreshToken, getMe } from '../controllers/auth.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

// Ruta de Login (no requiere autenticación previa)
router.post('/login', login);

// Ruta de Logout (requiere que el usuario esté autenticado para cerrar su propia sesión)
router.post('/logout', authorizeRoles(['admin', 'contrastista', 'financiero', 'revisor']), logout); // Usamos tu propio middleware para consistencia

// Ruta de Refresco de Token (no requiere autenticación de Access Token, solo de Refresh Token interno)
router.post('/refresh-token', authorizeRoles(['admin', 'contrastista', 'financiero', 'revisor']), refreshToken);

// Ruta para obtener datos del usuario (requiere autenticación de Access Token)
router.get('/me', authenticateToken, authorizeRoles(['admin', 'contrastista', 'financiero', 'revisor']), getMe);


export default router;