import logger from "../logs/logger.js";

const authorizeRoles = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        logger.info(`[AUTH] User ${req.user.email} attempted to access a restricted resource.`);
        return res.status(403).json({ msg: "Access denied. Insufficient permissions." });
      }
      next();
    };
  };
  
  export default authorizeRoles;