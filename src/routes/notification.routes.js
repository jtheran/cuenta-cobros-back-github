import { Router } from 'express';
import passport from 'passport';
import { deletedNotification, getNotificationById, getNotifications, markAsRead }  from '../controllers/notification.controller.js'
import authorizeRoles from '../middlewares/auth.js';
 
const router = Router();

router.get('/notification', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getNotifications);

router.get('/notification/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getNotificationById);

router.put('/notification/mark-read', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), markAsRead);

router.delete('/notification', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), deletedNotification);

export default router;