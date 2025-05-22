const config = require('./config/config.js');
const server = require('./app.js');
const logger = require('./logs/logger.js');
import adminCreate from './seed/admin.js';
import { initSocket } from './utils/socket.js';


adminCreate().then(() => {
    app.listen(config.port, async () => {
        logger.info(`[SERVER] 🚀 Server running on port ${config.port}`);
        initSocket(app);
    });
});
