import { Router } from 'express';
import passport from 'passport';
import { deleteFile, downloadFile, getFiles }  from '../controllers/file.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
 
const router = Router();

router.get('/file', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getFiles);

router.delete('/file/:id', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), deleteFile);

router.get('/download/file/:id', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), downloadFile);

export default router;