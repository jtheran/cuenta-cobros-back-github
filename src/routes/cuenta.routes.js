import { Router } from 'express';
import upload from '../libs/multer.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'; 
import { createCuenta, deleteCuenta, getCuentaByID, getCuentas, updateCuenta } from '../controllers/cuenta.controller.js';


const router = Router();

router.get('/cuenta', authenticateToken, authorizeRoles(['admin', 'contrastista', 'revisor', 'financiero']), getCuentas);

router.get('/cuenta/:id', authenticateToken, authorizeRoles(['admin', 'contrastista', 'revisor', 'financiero']), getCuentaByID);

router.post('/cuenta', authenticateToken, authorizeRoles(['admin', 'contrastista']), createCuenta);

router.put('/cuenta/:id', authenticateToken, authorizeRoles(['admin','revisor', 'financiero']), upload.array('files', 5), updateCuenta);

router.delete('/cuenta/:id', authenticateToken, authorizeRoles(['admin']), deleteCuenta);

export default router;