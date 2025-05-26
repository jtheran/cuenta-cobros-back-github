import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'; 
import { getContrats, getContractByID, createContract, deleteContrac, updateContract } from '../controllers/contrato.controller.js';
import upload from '../libs/multer.js';


const router = Router();

// Rutas protegidas con authenticateToken y authorizeRoles
router.get('/contract', authenticateToken, authorizeRoles(['admin', 'contrastista']), getContrats);

router.get('/contract/:id', authenticateToken, authorizeRoles(['admin', 'contrastista']), getContractByID);

router.post('/contract', authenticateToken, authorizeRoles('admin'), createContract);

router.delete('/contract/:id', authenticateToken, authorizeRoles('admin'), deleteContrac);

router.put('/contract/:id', authenticateToken, authorizeRoles('admin'), upload.array('files', 5), updateContract);


export default router;