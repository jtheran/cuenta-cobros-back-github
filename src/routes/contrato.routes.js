import { Router } from 'express';
import passport from 'passport';
import upload from '../libs/multer.js';
import authorizeRoles from '../middlewares/auth.js';
import { getContrats, getContractByID, createContract, deleteContrac, updateContract } from '../controllers/contrato.controller.js';

const router = Router();

router.get('/contract', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contrastista']), getContrats);

router.get('/contract/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contrastista']), getContractByID);

router.post('/contract', passport.authenticate('jwt', { session: false}), authorizeRoles('admin'), createContract);

router.put('/contract/:id', passport.authenticate('jwt', { session: false}), authorizeRoles('admin'), upload.array('files', 5), updateContract);

router.delete('/contract/:id', passport.authenticate('jwt', { session: false}), authorizeRoles('admin'), deleteContrac);

export default router;