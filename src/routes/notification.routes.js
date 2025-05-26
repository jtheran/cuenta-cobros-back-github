import { Router } from 'express';
import passport from 'passport';
import { getNotificaciones, getNotificacionByID, markRead, deleteNotificacion }  from '../controllers/notificacion.controller.js'
import authorizeRoles from '../middlewares/auth.js';
 
const router = Router();

router.get('/notification', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getNotificaciones);

router.get('/notification/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getNotificacionByID);

router.put('/notification/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), markRead);

router.delete('/notification', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), deleteNotificacion);

export default router;