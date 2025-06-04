import logger from '../logs/logger.js';
import { enviarNotificaciones } from '../utils/functions.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getPagos = async (req, res) => {
    try{
        const filtros = {};

        if (req.user.role === 'financiero') {
            filtros.financieroId = req.user.id;
        }
        const pagos = await prisma.pago.findMany({
            where: filtros,
            include: {
                    cuentaCobro: {
                        include: {
                            documentos: true,
                            contratista: {
                                include:{
                                    documentos: true,
                                }
                            },
                            contrato: {
                                include: {
                                    documentos: true,
                                }
                            } 
                        }
                    },
                financiero:  true,
            }
        });

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
        const filtros = {
            id: pagoID,
        };

        if (req.user.role === 'financiero') {
            filtros.financieroId = req.user.id;
        }

        const pago = await prisma.pago.findUnique({
            where: filtros,
            include: {
                    cuentaCobro: {
                        include: {
                            documentos: true,
                            contratista: {
                                include:{
                                    documentos: true,
                                }
                            },
                            contrato: {
                                include: {
                                    documentos: true,
                                }
                            } 
                        }
                    },
                financiero:  true,
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

        const pago = await prisma.$transaction([
            prisma.pago.create({
                data: {
                    valor,
                    metodoPago,
                    cuentaCobroId,
                    financieroId: req.user.id,
                    estado: 'INIICADO',
                },
                include: {
                    cuentaCobro: {
                        include: {
                            documentos: true,
                            contratista: {
                                include:{
                                    documentos: true,
                                }
                            },
                            contrato: {
                                include: {
                                    documentos: true,
                                }
                            } 
                        }
                    },
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
            await enviarNotificaciones(`SE HA CREADO EL PAGO DE LA CUENTA DE COBRO # ${pago[1].numeroCuenta}`,
                `SE HA INICIADO EL PROCESO PARA REALIZAR EL PAGO DE LA CUENTA DE COBRO # ${pago[1].numeroCuenta} DEL CONTRATO # ${pago[1].contrato.numero}<br>
                POR PARTE DEL FINANCIERO ${pago[0].financiero.nombre} ${pago[0].financiero.apellido}`,
                pago[1].contratista
            );
            logger.info('[NOTIFICACION] SE HA ENVIADO NOTIFICACION!!!!');
        }

        logger.info('[PRISMA] CREACION DE PAGO EXITOSO!!!!');
        return res.status(201).json({msg: 'CREACION DE PAGO EXITOSO', pago: pago[0] })
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updatePago = async (req, res) => {
    try{
        let status;
        const pagoID = req.params.id;
        const filtros = {
            id: pagoID,
        };

        if (req.user.role === 'financiero') {
            filtros.financieroId = req.user.id;
        }
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
                where: filtros,
                data: {
                    estado,
                    observaciones,
                    referenciaPago,
                    comprobante,
                    fechaPago,
                },
                include: {
                    cuentaCobro: {
                        include: {
                            documentos: true,
                            contratista: {
                                include:{
                                    documentos: true,
                                }
                            },
                            contrato: {
                                include: {
                                    documentos: true,
                                }
                            } 
                        }
                    },
                    financiero: true,
                }
            }),
            prisma.cuentaCobro.update({
                where: {
                    id: cuentaCobroId,
                },
                data: {
                    estado: status,
                },
                include: {
                    contratista: true,
                }
            }),
        ]);

        if(!pago){
            logger.warn('[PRISMA] ACTUALIZACION DEL PAGO FALLIDA!!!!');
            return res.status(400).json({msg: 'CREACION DEL PAGO FALLIDA'});
        }else{
            await enviarNotificaciones(`SE HA ACTUALIZADO EL PAGO DE LA CUENTA DE COBRO # ${pago[1].numeroCuenta}`,
                `SE HA ACTUALIZADO EL ESTADO DEL PAGO DE LA CUENTA DE COBRO # ${pago[1].numeroCuenta} A ESTADO ${pago[0].estado}
                Y LA CUENTA DE COBRO A PASADO A ESTADO ${pago[1].estado}`,
                pago[1].contratista
            );
            logger.info('[NOTIFICACION] SE HA ENVIADO NOTIFICACION!!!!');
        }

        logger.info('[PRISMA] ACTUALIZACION DE PAGO EXITOSA!!!!');
        return res.status(200).json({msg: 'ACTUALIZACION DE PAGO EXITOSA', pago: pago[0] })
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const deletePago = async (req, res) => {
    try{
        const { id } = req.params;

        const pago = await prisma.pago.findUnique({
            where: {
                id,
            }
        });

        if(!pago){
            logger.warn('[PRISMA] NO SE HA ENCONTRADO EL PAGO!!!!');
            return res.status(404).json({msg: 'NO SE HA ENCONTRADO EL PAGO'});
        }

        const deletePago = await prisma.pago.delete({
            where: {
                id: pago.id,
            },
            include: {
                cuentaCobro: true,
                financiero: true,
            }
        });

        if(!deletePago){
            logger.warn('[PRISMA] PROCESO DE ELIMINACION DE PAGO FALLIDO!!!!');
            return res.status(400).json({msg: 'PROCESO DE ELIMINACION DE PAGO FALLIDO'});
        }

        logger.info('[PRISMA] PROCESO DE ELIMINACION DE PAGO EXITOSO!!!!!');
        return res.status(200).json({msg: 'PROCESO DE ELIMINACION DE PAGO EXITOSO', pago: deletePago })
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

