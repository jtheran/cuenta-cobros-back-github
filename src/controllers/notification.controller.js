import logger from '../logs/logger.js';
import { getIO } from '../utils/socket.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1)*limit;


        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                skip,
                take: limit,
                where: {
                    userId: req.user.id
                }
            }),
            prisma.notification.count()
        ]);

        if(!notifications){
            logger.warn('[PRISMA] NOTIFICATIONS NOT FOUND!!!!!');
            return res.status(404).json({msg: 'NOTIFICATIONS NOT FOUND'});
        }

        logger.info('[PRISMA] NOTIFICATIONS FOUND!!!!!');
        return res.status(200).json({msg: 'NOTIFICATIONS FOUND', page, pages: Math.ceil(total/limit), count: total, notification: notifications });
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const getNotificationById = async (req, res) => {
    try{
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: {
                id
            }
        });

        if(!notification){
            logger.warn('[PRISMA] NOTIFICATION NOT FOUND!!!!!');
            return res.status(404).json({msg: 'NOTIFICATION NOT FOUND'});
        }

        logger.info('[PRISMA] NOTIFICATION FOUND!!!!!');
        return res.status(200).json({msg: 'NOTIFICATION FOUND', notification });
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const markAsRead = async (req, res) => {
    try{
        const { id } = req.params;
        const updatedNotify = await prisma.notification.update({
            where: { id },
            data: { read: true },
        });

        if(!updatedNotify){
            logger.warn('[PRISMA] NOTIFICATION NOT MARK!!!!!');
            return res.status(404).json({msg: 'NOTIFICATION NOT MARK'});
        }
        
        logger.info('[NOTIFICATION] NOTIFICATION MARK!!!!');
        return res.status(200).json({msg: 'NOTIFICATION MARK', notification: updatedNotify });
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
};

export const deletedNotification = async (req, res) => {
    try{
        const deletedNotifys = await prisma.notification.deleteMany();

        if(!deletedNotifys){
            logger.warn('[NOTIFICATION] NOTIFICATIONS NOT DELETED!!!');
            return res.status(400).json({msg: 'NOTIFICATIONS NOT DELETED'});
        }

        logger.info('[NOTIFICATION] NOTIFICATIONS DELETED!!!!');
        return res.status(200).json({msg: 'NOTIFICATIONS DELETED', notification: deletedNotifys })
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}