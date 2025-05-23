import jwt from 'jsonwebtoken';
import logger from '../logs/logger.js';
import config from '../config/config.js';

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

export default createToken;