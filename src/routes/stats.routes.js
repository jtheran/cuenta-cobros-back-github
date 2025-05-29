import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'; 
import { statsAdmin, statsContratista, statsFinanciero, statsRevisor } from '../controllers/stats.controller.js';


const router = Router();

router.get('/stats-admin', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), statsAdmin);

router.get('/stats-contratista', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), statsContratista);

router.get('stats-revisor', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), statsRevisor);

router.get('stats-financiero', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), statsFinanciero);

export default router;