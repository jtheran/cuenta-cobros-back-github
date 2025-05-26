import { Router } from 'express';
import { getNotificaciones, getNotificacionByID, markRead, deleteNotificacion }  from '../controllers/notificacion.controller.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/notification', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getNotificaciones);

router.get('/notification/:id', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getNotificacionByID);

router.put('/notification/:id', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), markRead);

router.delete('/notification', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), deleteNotificacion);

export default router;