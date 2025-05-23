import { Router } from 'express';
import passport from 'passport';
import { sendEmailBack, sendEmailMassiveBack }  from '../controllers/email.controller.js';
import authorizeRoles from '../middlewares/auth.js';
 
const router = Router();

router.post('/email', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin']), sendEmailBack);

router.post('/email-massive', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin']), sendEmailMassiveBack);

export default router;