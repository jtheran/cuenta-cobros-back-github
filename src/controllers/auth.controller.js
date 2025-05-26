import logger from '../logs/logger.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { matchPass } from '../libs/bcrypt.js';
import createToken from '../libs/jwt.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();


export const login = async (req, res) => {
    try{
        const { email, password} = req.body;
        const user = await prisma.usuario.findUnique({
            where: {
                email
            }
        });

        if(!user){
            logger.warn('[PRISMA] USUARIO NO ESTA REGISTRADO!!!');
            return res.status(404).json({msg: 'USUARIO NO ESTA REGISTRADO'});
        }

        const isValidated = await matchPass(password, user.password);

        if(!isValidated){
            logger.warn('[AUTH] CORREO O PASSWORD ERRONEA!!!!');
            return res.status(400).json({msg: 'CORREO O PASSWORD ERRONEA'});
        }

        const data = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const payload = createToken(data);

        await prisma.usuario.update({
            where: {
                id: user.id
            },
            data: {
                ultimoAcceso: new Date(),
            }
        });

        logger.info('LOGUEADO CORRECTAMENTE!!!');
        return res.status(200).json({msg: 'LOGUEADO CORRECTAMENTE', access_token: payload.token, refresh_token: payload.refreshToken });
    }catch(err){
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message});
    }
};

export const logout = (req, res) => {
    try{
        return res.header('Autorization', '').status(200).json({msg: 'HA SIDO DESLOGUEADO!!!'});
    }catch(err){
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message});
    }
};

export const refreshToken = async (req, res) => {
    try{
        const { refreshToken } = req.body;

        if(!refreshToken){
            logger.warn('[JWT] REFRESH TOKEN REQUERIDO!!!!')
            return res.status(400).json({ msg: 'REFRESH TOKEN REQUERIDO' });
        }

        const payload = jwt.verify(refreshToken, config.refreshKey);

        if(!payload){
            logger.warn('[JWT] VERIFICACION DE REFRESH TOKEN FALLADA');
            return res.status(401).json({ msg: 'VERIFICACION DE REFRESH TOKEN FALLADA' });
        }

        const newAccessToken = jwt.sign({ id: payload.id, email: payload.email, role: payload.role }, config.key, {
            expiresIn: '30m',
        });

        if(!newAccessToken){
            logger.warn('[JWT] GENERACION DEL NUEVO TOKEN FALLADA');
            return res.status(400).json({ msg: 'GENERACION DEL NUEVO TOKEN FALLADA' });
        }

        logger.info('[JWT] GENERACION DEL NUEVO TOKEN EXITOSA!!!');
        return res.status(200).json({ msg: 'GENERACION DEL NUEVO TOKEN EXITOSA', token: newAccessToken });
    }catch(err){
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR'});
    }
}


