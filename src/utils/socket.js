import logger from '../logs/logger.js';
import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server);

    io.on('connection', (socket) => {
        logger.info('🟢 Nuevo socket conectado:', socket.id);

        socket.on('disconnect', () => {
            logger.warn('🔴 Socket desconectado');
        });
    });

    return io;
};

export const getIO = () => {
    if(!io){
        logger.error('❌ Socket.IO no ha sido inicializado.');
        throw new Error();
    }
    return io;
};
