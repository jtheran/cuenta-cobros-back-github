import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'; 
import { statsAdmin, statsContratista, statsFinanciero, statsRevisor } from '../controllers/stats.controller.js';


const router = Router();

router.get('/stats-admin', authenticateToken, authorizeRoles(['admin']), statsAdmin);

router.get('/stats-contratista', authenticateToken, authorizeRoles(['admin', 'contratista']), statsContratista);

router.get('/stats-revisor', authenticateToken, authorizeRoles(['admin', 'revisor']), statsRevisor);

router.get('/stats-financiero', authenticateToken, authorizeRoles(['admin', 'financiero']), statsFinanciero);

export default router;