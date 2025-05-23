import { Router } from 'express';
import passport from 'passport';
import { login, logout } from '../controllers/auth.controller.js';
const router = Router();

router.post('/login', login);

router.get('/logout', passport.authenticate('jwt', { session: false}), logout);


export default router;