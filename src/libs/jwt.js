const jwt = require('jsonwebtoken');
const logger = require('../logs/logger.js');
const config = require('../config/config.js');

const createToken = (payload) => {

    const token = jwt.sign(payload, config.key,{
        expiresIn: 3600
    });
    if(!token){
        logger.error('TOKEN NO FUE CREADO!!!');
        return null;
    }
    logger.info('TOKEN CREADO!!!');
    return token;
}

module.exports = createToken;