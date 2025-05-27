import { Router } from 'express';
import { login, logout, refreshToken, getMe } from '../controllers/auth.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();


router.post('/login', login);

// Ruta de Logout (requiere que el usuario esté autenticado para cerrar su propia sesión)
router.post('/logout', logout); // Usamos tu propio middleware para consistencia

// Ruta de Refresco de Token (no requiere autenticación de Access Token, solo de Refresh Token interno)
router.post('/refresh-token', authorizeRoles(['admin', 'contrastista', 'financiero', 'revisor']), refreshToken);

// Ruta para obtener datos del usuario (requiere autenticación de Access Token)
router.get('/me', authenticateToken, authorizeRoles(['admin', 'contrastista', 'financiero', 'revisor']), getMe);


export default router;