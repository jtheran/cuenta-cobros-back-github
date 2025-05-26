import { Router } from 'express';
import { sendEmailBack, sendEmailMassiveBack }  from '../controllers/email.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.post('/email', authenticateToken, authorizeRoles(['admin']), sendEmailBack);

router.post('/email-massive', authenticateToken, authorizeRoles(['admin']), sendEmailMassiveBack);

export default router;