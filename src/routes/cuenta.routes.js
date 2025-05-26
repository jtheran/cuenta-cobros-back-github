import { Router } from 'express';
import passport from 'passport';
import upload from '../libs/multer.js';
import authorizeRoles from '../middlewares/auth.js';
import { createCuenta, deleteCuenta, getCuentaByID, getCuentas, updateCuenta } from '../controllers/cuenta.controller.js';


const router = Router();

router.get('/cuenta', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contrastista', 'revisor', 'financiero']), getCuentas);

router.get('/cuenta/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contrastista', 'revisor', 'financiero']), getCuentaByID);

router.post('/cuenta', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contrastista']), createCuenta);

router.put('/cuenta/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin','revisor', 'financiero']), upload.array('files', 5), updateCuenta);

router.delete('/cuenta/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin']), deleteCuenta);

export default router;