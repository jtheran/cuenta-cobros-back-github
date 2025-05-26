import logger from '../logs/logger.js';
import { getIO } from './socket.js';
import { sendEmail } from '../services/nodemailer.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const generarNumeroContrato = async () => {
    const añoActual = new Date().getFullYear();

    const ultimaCuenta = await prisma.contrato.findFirst({
        where: {
            numero: {
                startsWith: `CT-${añoActual}`
            }
        },
        orderBy: {
            numero: 'desc'
        }
    });

    let nuevoConsecutivo = 1;

    if (ultimaCuenta) {
        logger.info('[PRISMA] ULTIMO CONTRATO CREADO ENCONTRADO!!!!!')
        const partes = ultimaCuenta.numero.split('-');
        const ultimoNumero = parseInt(partes[2]);
        nuevoConsecutivo = ultimoNumero + 1;
    }

    logger.info('[SERVER] NUMERO DE CONTRATO UNICO GENERADO AUTOMATICAMENTE!!!!!')
    const numeroFormateado = String(nuevoConsecutivo).padStart(4, '0');
    return `CT-${añoActual}-${numeroFormateado}`;
};

export const generarNumeroCuenta = async () => {
    const añoActual = new Date().getFullYear();

    const ultimaCuenta = await prisma.cuentaCobro.findFirst({
        where: {
            numeroCuenta: {
                startsWith: `CC-${añoActual}`
            }
        },
        orderBy: {
            numeroCuenta: 'desc'
        }
    });

    let nuevoConsecutivo = 1;

    if (ultimaCuenta) {
        logger.info('[PRISMA] ULTIMA CUENTA DE COBRO CREADA ENCONTRADA!!!!!')
        const partes = ultimaCuenta.numeroCuenta.split('-');
        const ultimoNumero = parseInt(partes[2]);
        nuevoConsecutivo = ultimoNumero + 1;
    }

    logger.info('[SERVER] NUMERO DE CUENTA DE COBRO UNICO GENERADO AUTOMATICAMENTE!!!!!')
    const numeroFormateado = String(nuevoConsecutivo).padStart(4, '0');
    return `CC-${añoActual}-${numeroFormateado}`;
};

export const calcularPorcentajeEjecucion = (periodoInicio, periodoFin) => {
    const inicio = new Date(periodoInicio);
    const fin = new Date(periodoFin);
    const hoy = new Date();

    if (hoy <= inicio){
        logger.info('[SERVER] PROCENTAJE DE EJECUCION DEL CONTRATO ES: 0%');
        return 0;
    }

    if (hoy >= fin){
        logger.info('[SERVER] PROCENTAJE DE EJECUCION DEL CONTRATO ES: 0%');
        return 100;
    }

    const totalTiempo = fin.getTime() - inicio.getTime();
    const tiempoTranscurrido = hoy.getTime() - inicio.getTime();

    const porcentaje = (tiempoTranscurrido / totalTiempo) * 100;
    logger.info(`[SERVER] PORCENTAJE DE EJECUCCION ES: ${porcentaje}%`);
    return Math.round(porcentaje); 
};

export const enviarNotificaciones = async (titulo, contenido, user) => {
    try{
        const io = await getIO();
        const notificacion = await prisma.notificacion.create({
            data: {
                usuarioId: user.id,
                contenido: contenido,
                asunto: titulo,
            }
        });

        if(!notificacion){
            logger.warn('[PRISMA] CREACION DE NOTIFICACION FALLIDA!!!!');
            return res.status(404).json({msg: 'CREACION DE NOTIFICACION FALLIDA'});
        }else{
            logger.warn('[PRISMA] CREACION DE NOTIFICACION EXITOSA!!!!');
            io.emit('notificacion', {
                titulo,
                contenido,
                fecha: new Date(),
            });
            await sendEmail(user.email, titulo, contenido, user.name);
        }
    }catch(err){
        logger.error('[SERVER] ERROR AL GENERAR NOTIFICACIONES!!!!');
        return new Error('ERROR AL GENERAR NOTIFICACIONES');
    }
}