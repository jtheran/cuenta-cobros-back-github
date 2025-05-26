import { Router } from 'express';
// import passport from 'passport'; // Podrías quitarlo si no lo usas en otras partes
import { login, logout, refreshToken, getMe } from '../controllers/auth.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();


router.post('/login', login);

<<<<<<< HEAD
router.post('/logout', logout);

router.post('/refresh-token', refreshToken);

router.get('/me', authenticateToken, getMe);
=======
// Ruta de Logout (requiere que el usuario esté autenticado para cerrar su propia sesión)
router.post('/logout', authorizeRoles(['admin', 'contrastista', 'financiero', 'revisor']), logout); // Usamos tu propio middleware para consistencia

// Ruta de Refresco de Token (no requiere autenticación de Access Token, solo de Refresh Token interno)
router.post('/refresh-token', authorizeRoles(['admin', 'contrastista', 'financiero', 'revisor']), refreshToken);

// Ruta para obtener datos del usuario (requiere autenticación de Access Token)
router.get('/me', authenticateToken, authorizeRoles(['admin', 'contrastista', 'financiero', 'revisor']), getMe);
>>>>>>> fe00679c2d4d94d3832a964c68233112a57a4d8c


export default router;