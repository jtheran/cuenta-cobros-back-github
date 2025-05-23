import logger from '../logs/logger.js';
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

        const token = createToken(data);

        logger.info('LOGUEADO CORRECTAMENTE!!!');
        return res.status(200).json({msg: 'LOGUEADO CORRECTAMENTE', access_token: token});
    }catch(err){
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message});
    }
};

export const logout = (req, res) => {
    try{
        res.header('Autorization', '').status(200).json({msg: 'HA SIDO DESLOGUEADO!!!'});
    }catch(err){
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message});
    }
};


