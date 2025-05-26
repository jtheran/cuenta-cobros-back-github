import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { getRevisiones, getRevisionByID, createRevision, updateRevision, deleteRevision } from '../controllers/revision.controller.js';

const router = Router();

router.get('/revision', authenticateToken, authorizeRoles(['admin', 'revisor']), getRevisiones);

router.get('/revision/:id', authenticateToken, authorizeRoles(['admin', 'revisor']), getRevisionByID);

router.post('/revision', authenticateToken, authorizeRoles(['admin', 'revisor']), createRevision);

router.put('/revision/:id', authenticateToken, authorizeRoles(['admin', 'revisor']), updateRevision);

router.delete('/revision/:id', authenticateToken, authorizeRoles(['admin']), deleteRevision);

export default router;