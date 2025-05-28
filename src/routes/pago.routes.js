import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'; 
import { getPagoByID, getPagos, createPago, updatePago, deletePago } from '../controllers/pago.controller.js'

const router = Router();

router.get('/pago', authenticateToken, authorizeRoles(['admin', 'financiero']), getPagos);

router.get('/pago/:id', authenticateToken, authorizeRoles(['admin', 'financiero']), getPagoByID);

router.post('/pago', authenticateToken, authorizeRoles(['admin', 'financiero']), createPago);

router.put('/pago/:id',  authenticateToken, authorizeRoles(['admin', 'financiero']), updatePago);

router.delete('/pago/:id',  authenticateToken, authorizeRoles(['admin']), deletePago);

export default router;