import express from "express";
import passport from "passport";
import { getServerMetrics } from '../libs/metrics.js';
import authorizeRoles from '../middlewares/auth.js';

const router = express.Router();

router.get('/metrics', passport.authenticate('jwt', { session: false}), authorizeRoles('admin'), getServerMetrics);

export default router;
