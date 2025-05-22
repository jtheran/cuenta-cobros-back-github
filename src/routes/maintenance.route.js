import express from "express";
import passport from "passport";
import { setMaintenanceMode } from "../middlewares/maintenance.js";
import { getServerMetrics } from "../lib/metrics.js";
import authorizeRoles from '../middlewares/auth.js';

const router = express.Router();

router.post("/maintenance", passport.authenticate('jwt', { session: false}), authorizeRoles('ADMIN'),(req, res) => {
  const { status } = req.body;

  if (typeof status !== "boolean") {
    return res.status(400).json({ message: "Invalid status value" });
  }

  setMaintenanceMode(status);

  res.json({ message: `Maintenance mode set to ${status}` });
});

router.get('/metrics', passport.authenticate('jwt', { session: false}), authorizeRoles('ADMIN'), getServerMetrics);

export default router;
