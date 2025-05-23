import { Router } from 'express';
import passport from 'passport';
import upload from '../libs/multer.js';
import { deleteFile, downloadFile, getFileById, getFiles, uploadFile }  from '../controllers/file.controller.js';
import authorizeRoles from '../middlewares/auth.js';
 
const router = Router();

router.get('/file', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getFiles);

router.get('/file/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getFileById);

router.delete('/file/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), deleteFile);

router.post('/upload/file', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']),  upload.single('file'), uploadFile);

router.get('/download/file/:id', passport.authenticate('jwt', { session: false}), authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), downloadFile);

export default router;