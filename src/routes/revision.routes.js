import { Router } from 'express';
import passport from 'passport';
import authorizeRoles from '../middlewares/auth.js';
import { getRevisiones, getRevisionByID, createRevision, updateRevision, deleteRevision } from '../controllers/revision.controller.js';

const router = Router();

router.get('/revision', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'revisor']), getRevisiones);

router.get('/revision/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'revisor']), getRevisionByID);

router.post('/revision', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'revisor']), createRevision);

router.put('/revision/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'revisor']), updateRevision);

router.delete('/revision/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin']), deleteRevision);

export default router;