import logger from '../logs/logger.js';
import { enviarNotificaciones } from '../utils/functions.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getPagos = async (req, res) => {
    try{
        const pagos = await prisma.pago.findMany();

        if(!pagos){
            logger.warn('[PRISMA] PAGOS NO ENCONTRADOS O NO EXISTEN!!!');
            return res.status(404).json({msg: 'PAGOS NO ENCONTRADOS O NO EXISTEN'});
        }

        logger.info('[PRISMA] LISTA DE PAGOS!!!!');
        return res.status(200).json({msg: 'LISTA DE PAGOS', pago: pagos });
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const getPagoByID = async (req, res) => {
    try{
        const pagoID = req.params.id;

        const pago = await prisma.pago.findUnique({
            where: {
                id: pagoID,
            },
            include: {
                cuentaCobro: true,
                financiero: true,
            }
        });

        if(!pago){
            logger.warn('[PRISMA] PAGO NO ENCONTRADO!!!!');
            return res.status(404).json({msg: 'PAGO NO ENCONTRADO'});
        }

        logger.info('[PRISMA] PAGO ENCONTRADO!!!');
        return res.status(200).json({msg: 'PAGO ENCONTRADO', pago });
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const createPago = async (req, res) => {
    try{
        const { 
            valor,
            metodoPago,
            cuentaCobroId,
        } = req.body;

        const pago = await await prisma.$transaction([
            prisma.pago.create({
                data: {
                    valor,
                    metodoPago,
                    cuentaCobroId,
                    estado: 'REVISION',
                },
                include: {
                    cuentaCobro: true,
                    financiero: true,
                }
            }),
            prisma.cuentaCobro.findUnique({
                where: {
                    id: cuentaCobroId,
                },
                include: {
                    contratista: true,
                    contrato: true,
                }
            })
        ]);

        if(!pago){
            logger.warn('[PRISMA] CREACION DEL PAGO FALLIDO!!!!');
            return res.status(400).json({msg: 'CREACION DEL PAGO FALLIDO'});
        }else{
            logger.info('[NOTIFICACION] SE HA ENVIADO NOTIFICACION!!!!');
            await enviarNotificaciones(`SE HA CREADO EL PAGO DE LA CUENTA DE COBRO # ${pago[1].numeroCuenta}`,
                `SE HA INICIADO EL PROCESO PARA REALIZAR EL PAGO DE LA CUENTA DE COBRO # ${pago[1].numeroCuenta} DEL CONTRATO # ${pago[1].contrato.numero}`,
                pago[1].contratista
            );
        }

        logger.info('[PRISMA] CREACION DE PAGO EXITOSO!!!!');
        return res.status(201).json({msg: 'CREACION DE PAGO EXITOSO', pago })
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updatePago = async (req, res) => {
    try{
        let status;
        const pagoID = req.params.id;
        const {
            estado,
            observaciones,
            referenciaPago,
            comprobante,
            fechaPago,
            cuentaCobroId,
        } = req.body;

        if(estado==='APROBADO'){
            status = 'PAGADA';
        }else{
            status = 'RECHAZADA'
        }

        const pago = await prisma.$transaction([
            prisma.pago.update({
                where: {
                    id: pagoID,
                },
                data: {
                    estado,
                    observaciones,
                    referenciaPago,
                    comprobante,
                    fechaPago,
                },
                include: {
                    cuentaCobro: true,
                    financiero: true,
                }
            }),
            prisma.cuentaCobro.update({
                where: {
                    id: cuentaCobroId,
                },
                data: {
                    estado: status,
                }
            }),
        ]);
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

