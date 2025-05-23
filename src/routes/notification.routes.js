import { Router } from 'express';
import passport from 'passport';
import { deletedNotification, getNotificationById, getNotifications, markAsRead }  from '../controllers/notification.controller.js'
import authorizeRoles from '../middlewares/auth.js';
 
const router = Router();

router.get('/notification', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), getNotifications);

router.get('/notification/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), getNotificationById);

router.put('/notification/mark-read', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), markAsRead);

router.delete('/notification', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), deletedNotification);

export default router;