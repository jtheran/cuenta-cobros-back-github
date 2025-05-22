import { Router } from 'express';
import passport from 'passport';
import { sendEmailBack, sendEmailMassiveBack }  from '../controller/email.controller.js';
import authorizeRoles from '../middlewares/auth.js';
 
const router = Router();

router.post('/email', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), sendEmailBack);

router.post('/email-massive', passport.authenticate('jwt', { session: false}), authorizeRoles(['ADMIN', 'USER']), sendEmailMassiveBack);

export default router;