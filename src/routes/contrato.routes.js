import { Router } from 'express';
<<<<<<< HEAD
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'; 
import { getContrats, getContractByID, createContract, deleteContract, updateContract } from '../controllers/contrato.controller.js';
=======
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { getContrats, getContractByID, createContract, deleteContrac, updateContract } from '../controllers/contrato.controller.js';
>>>>>>> c1f06d0528fcbdf2fbaa871a8aa26c7f11729513
import upload from '../libs/multer.js';


const router = Router();

// Rutas protegidas con authenticateToken y authorizeRoles
router.get('/contract', authenticateToken, authorizeRoles(['admin', 'contratista']), getContrats);

router.get('/contract/:id', authenticateToken, authorizeRoles(['admin', 'contratista']), getContractByID);

router.post('/contract', authenticateToken, authorizeRoles(['admin']), createContract);

router.delete('/contract/:id', authenticateToken, authorizeRoles(['admin']), deleteContract);

router.put('/contract/:id', authenticateToken, authorizeRoles(['admin', 'contratista']), upload.array('files', 5), updateContract);


export default router;