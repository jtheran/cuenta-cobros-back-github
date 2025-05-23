import jwt from 'jsonwebtoken';
import logger from '../logs/logger.js';
import config from '../config/config.js';

export const createToken = (payload) => {

    const token = jwt.sign(payload, config.key,{
        expiresIn: '1h'
    });

    const refreshToken = jwt.sign(payload, config.refreshKey, {
        expiresIn: '1d'
    })

    if(!token){
        logger.error('[JWT] TOKEN NO FUE CREADO!!!');
        return null;
    }

    if(!refreshToken){
        logger.error('[JWT] REFRESH TOKEN NO FUE CREADO!!!');
        return null;
    }
    logger.info('[JWT] TOKEN Y REFRESH TOKEN  CREADO!!!');
    return {token, refreshToken };
}

export default createToken;