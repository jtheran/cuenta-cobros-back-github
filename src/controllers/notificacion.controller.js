import logger from '../logs/logger.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getNotificaciones = async (req, res) => {
    try{
        const usuarioID = req.user.id;

        const notificaciones = await prisma.notificacion.findMany({
            where: {
                usuarioId: usuarioID,
            }
        });

        if(!notificaciones){
            logger.warn('[PRISMA] NOTIFICACIONES NO ENCONTRADAS O NO EXISTEN!!!!');
            return res.status(404).json({msg: 'NOTIFICACIONES NO ENCONTRADAS O NO EXISTEN'});
        }

        logger.info('[PRISMA] LISTA DE NOTIFICACIONES!!!!');
        return res.status(200).json({msg: 'LISTA DE NOTIFICACIONES', notificacion: notificaciones});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const getNotificacionByID = async (req, res) => {
    try{
        const notificacionID = req.params.id;

        const notificacion = await prisma.notificacion.findUnique({
            where: {
                id: notificacionID,
            }
        });

        if(!notificacion){
            logger.warn('[PRISMA] NOTIFICACION NO ENCONTRADA!!!!');
            return res.status(404).json({msg: 'NOTIFICACION NO ENCONTRADA'});
        }


    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const markRead = async (req, res) => {
    try{
        const notificacionID = req.params.id;
        const read = req.body.read;

        const notificacion = await prisma.notificacion.update({
            where: {
                id: notificacionID,
            }
        });

        if(!notificacion){
            logger.warn('[PRISMA] NOTIFICACION NO ENCONTRADA!!!!');
            return res.status(404).json({msg: ' NOTIFICACION NO ENCONTRADA'});
        }

        const updateNotificacion = await prisma.notificacion.update({
            where: {
                id: notificacion.id,
            },
            data: {
                read
            }
        });

        if(!updateNotificacion){
            logger.warn('[PRISMA] NOTIFICACION NO ACTUALIZADA!!!!!');
            return res.status(400).json({msg: 'NOTIFICACION NO ACTUALIZADA'});
        }

        logger.info('[PRISMA] NOTIFICACION LEIDA!!!!');
        return res.status(200).json({msg: 'NOTIFICACION LEIDA'});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const  deleteNotificacion = async (req, res) => {
    try{
        const usuarioID = req.user.id;
        const deleteNotificacion = await prisma.notificacion.deleteMany({
            where: {
                usuarioId: usuarioID,
            }
        });

        if(!deleteNotificacion){
            logger.warn('[PRISMA] PROCESO DE ELIMINACION DE NOTIFICACIONES FALLIDO!!!!');
            return res.status(404).josn({msg: 'PROCESO DE ELIMINACION DE NOTIFICACIONES FALLIDO'});
        }

        logger.info('[PRISMA] PROCESO DE ELIMINACION DE NOTIFICACIONES EXITOSO!!!!!');
        return res.status(200).json({msg: 'PROCESO DE ELIMINACION DE NOTIFICACIONES EXITOSO'});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}