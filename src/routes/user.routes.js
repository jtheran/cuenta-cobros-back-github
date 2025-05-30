import { Router } from 'express';
import upload from '../libs/multer.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';
import { getUsers, getUserByID, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';


const router = Router();

router.get('/user', authenticateToken, authorizeRoles('admin'), getUsers);

router.get('/user/:id', authenticateToken, authorizeRoles(['admin', 'contratista', 'revisor', 'financiero']), getUserByID);

router.post('/user', authenticateToken, authorizeRoles(['admin']), createUser);

router.put('/user/:id', authenticateToken, authorizeRoles(['admin']),  upload.array('files', 5), updateUser);

router.delete('/user/:id', authenticateToken, authorizeRoles(['admin']), deleteUser);


export default router;