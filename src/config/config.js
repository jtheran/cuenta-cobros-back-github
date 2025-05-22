const dotenv = require('dotenv');

dotenv.config();

const config = {
    port: process.env.PORT_DEV || 2048,
    port_db: process.env.PORT_DB,
    user_db: process.env.USER_DB,
    pass_db: process.env.PASS_DB,
    db: process.env.DB,
    key: process.env.KEY_SECRET,
};


module.exports = config;