const config = require('./config/config.js');
const server = require('./app.js');
const logger = require('./logs/logger.js');


server.listen(config.port, () => {
    logger.info('SERVER LISTEN ON THE PORT: ' + config.port);
});

