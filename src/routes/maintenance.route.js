import express from "express";
import { getServerMetrics } from '../libs/metrics.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.get('/metrics', authenticateToken, authorizeRoles(['admin']), getServerMetrics);

export default router;
