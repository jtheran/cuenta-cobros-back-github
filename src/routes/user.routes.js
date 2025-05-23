import { Router } from 'express';
import passport from 'passport';
import authorizeRoles from '../middlewares/auth.js';
import { getUsers, getUserByID, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = Router();

router.get('/user', passport.authenticate('jwt', { session: false}), authorizeRoles('admin'), getUsers);

router.get('/user/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getUserByID);

router.post('/user', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin']), createUser);

router.put('/user/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin']), updateUser);

router.delete('/user/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin']), deleteUser);
export default router;