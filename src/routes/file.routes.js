import { Router } from 'express';
import passport from 'passport';
import upload from '../libs/multer.js';
import { deleteFile, downloadFile, getFiles }  from '../controllers/file.controller.js';
import authorizeRoles from '../middlewares/auth.js';
 
const router = Router();

router.get('/file', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getFiles);

router.delete('/file/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), deleteFile);

router.get('/download/file/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), downloadFile);

export default router;