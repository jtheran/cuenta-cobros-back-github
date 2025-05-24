import { Router } from 'express';
import passport from 'passport';
import authorizeRoles from '../middlewares/auth.js';
import { getContrats, getContractByID, createContract } from '../controllers/contrato.controller.js';

const router = Router();

router.get('/contract', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contrastista']), getContrats);

router.get('/contract/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contrastista']), getContractByID);

router.post('/contract', passport.authenticate('jwt', { session: false}), authorizeRoles('admin'), createContract);

export default router;