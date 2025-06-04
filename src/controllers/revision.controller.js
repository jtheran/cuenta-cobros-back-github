import logger from '../logs/logger.js';
import { enviarNotificaciones } from '../utils/functions.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getRevisiones = async (req, res) => {
    try{
        const filtros = {};

        if (req.user.role === 'revisor') {
            filtros.revisorId = req.user.id;
        }

        const revisiones = await prisma.revision.findMany({
            where: filtros,
            include: {
                comentarios: true,
                cuentaCobro: true,
                revisor: true,
            }
        });

        if(!revisiones){
            logger.warn('[PRISMA] REVISIONES NO ENCONTRADAS O NO EXISTEN!!!!!');
            return res.status(400).json({msg: 'REVISIONES NO ENCONTRADAS O NO EXISTEN'});
        }

        logger.info('[PRISMA] LISTA DE REVISIONES ENCONTRADAS!!!!');
        return res.status(200).json({msg: 'LISTA DE REVISIONES ENCONTRADAS', revision: revisiones});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const getRevisionByID = async (req, res) => {
    try{
        const revisionID = req.params.id;

        const revision = await prisma.revision.findUnique({
            where: {
                id: revisionID,
            },
            include: {
                comentarios: true,
                cuentaCobro: true,
                revisor: true,
            }
        });

        if(!revision){
            logger.warn('[PRISMA] REVISION NO ENCONTRADO O NO EXISTEN!!!!');
            return res.status(404).json({msg: 'REVISION NO ENCONTRADO O NO EXISTEN'});
        }

        logger.info('[PRISMA] REVISION ENCONTRADA!!!!!');
        return res.status(200).json({msg: 'REVISION ENCONTRADA', revision});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const createRevision = async (req, res) => {
    try{
        const revisorID = req.user.id;
        const estado = 'REVISADA';
        const {
            cuentaCobroId,
            estadoCuenta,
            observaciones,
        } = req.body;

        const revision = await prisma.$transaction([
            prisma.revision.create({
                data: {
                    cuentaCobroId,
                    observaciones,
                    estado,
                    revisorId: revisorID,
                },
                include: {
                    cuentaCobro: {
                        include: {
                            contratista: true
                        }
                    },
                    comentarios: true,
                    revisor: true
                }
            }),
            prisma.cuentaCobro.update({
                where: {
                    id: cuentaCobroId,
                },
                data: {
                    estado: estadoCuenta
                },
                include: {
                    contratista: {
                        include: {
                            documentos: true
                        }
                    },
                    contrato: {
                        include: {
                            documentos: true,
                        }
                    },
                    documentos: true,
                    pagos: true,
                    revisiones: true,
                }
            })
        ]);

        if(!revision){
            logger.warn('[PRISMA] CREACION DE REVISION FALLIDA!!!');
            return res.status(400).json({msg: 'CREACION DE REVISION FALLIDA'});
        }

        await enviarNotificaciones(`REVISION CREADA PARA LA CUENTA DE COBRO # ${revision[1].numeroCuenta}`,
            `SE HA CREADO LA REVISION PARA LA CUENTA DE COBRO # ${revision[1].numeroCuenta} POR PARTE DEL REVSIOR ${revision[0].revisor.nombre} ${revision[0].revisor.apellido}<br>
            POR LAS SIGUIENTES OBSERVACIONES SE HA ${revision[1].estado} LA CUENTA DE COBRO<br>
            ${revision[0].observaciones}`,
            revision[1].contratista
        );

        logger.info('[PRISMA] CREACION DE REVISION EXITOSA!!!');
        return res.status(200).json({msg: 'CREACION DE REVISION EXITOSA', revision: revision[0], cuenta: revision[1]});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updateRevision = async (req, res) => {
    try{
        const revisionID = req.params.id;
        const {
            observaciones,
            estadoCuenta,
            estadoRevision,
        } = req.body;

        const revision = await prisma.revision.findUnique({
            where: {
                id: revisionID,
            },
            include: {
                cuentaCobro: {
                    include: {
                        contratista: true
                    }
                },
                comentarios: true,
                revisor: true
            }
        });

        if(!revision){
            logger.warn('[PRISMA] REVISION NO ENCONTRADO O NO EXISTEN!!!!');
            return res.status(404).json({msg: 'REVISION NO ENCONTRADO O NO EXISTEN'});
        }

        const updateRevision =  await prisma.$transaction([
            prisma.revision.update({
                where: {
                    id: revision.id,
                },
                data: {
                    observaciones,
                    estado: estadoRevision, 
                },
                include: {
                    cuentaCobro: true,
                    revisor: true
                }
            }),
            prisma.cuentaCobro.update({
                where: {
                    id: revision.cuentaCobroId,
                },
                data: {
                    estado: estadoCuenta,
                },
                include: {
                    contratista: true,
                    contrato: true,
                    documentos: true,
                    revisiones: true,
                    pagos: true
                }
            })
        ]);

        if(!updateRevision){
            logger.warn('[PRISMA] ACTUALIZACION DE REVISION FALLIDA!!!!');
            return res.status(400).json({msg: 'ACTUALIZACION DE REVISION FALLIDA'});
        }

        await enviarNotificaciones(`SE HA ACTUALIZADO LA REVISION DE LA CUENTA DE COBRO # ${updateRevision[1].numeroCuenta}`,
            `SE HA REVISADO LA CUENTA DE COBRO # ${updateRevision[1].numeroCuenta} Y SU ESTADO FINAL ES: ${updateRevision[1].estado}`,
            updateRevision[1].contratista
        );

        logger.info('[PRISMA] ACTUALIZACION DE REVISION Y CUANTA DE COBRO EXITOSA!!!!');
        return res.status(200).json({msg: 'ACTUALIZACION DE REVISION Y CUENTA DE COBRO EXITOSA', revision: updateRevision[0], cuenta: updateRevision[1]});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const deleteRevision = async (req, res) => {
    try{
        const revisionID = req.params.id;

        const revision = await prisma.revision.findUnique({
            where: {
                id: revisionID,
            }
        });

        if(!revision){
            logger.warn('[PRISMA] REVISION NO ENCONTRADO O NO EXISTEN!!!!');
            return res.status(404).json({msg: 'REVISION NO ENCONTRADO O NO EXISTEN'});
        }

        const deleteRevision = await prisma.revision.delete({
            where: {
                id: revision.id,
            },
            include: {
                cuentaCobro: {
                    include: {
                        contratista: true
                    }
                },
                revisor: true
            }

        });

        if(!deleteRevision){
            logger.warn('[PRISMA] REVISION NO ELIMINADA CORRECTAMENTE!!!!');
            return res.status(400).json({msg: 'REVISION NO ELIMINADA CORRECTAMENTE'});
        }

        await enviarNotificaciones(`SE HA ELIMINADO LA REVISION DE LA CUENTA DE COBRO # ${deleteRevision.cuentaCobro.numeroCuenta}`,
            `SE HA ELIMINADO LA REVISION DE LA CUENTA DE COBRO # ${deleteRevision.cuentaCobro.numeroCuenta} POR PARTE DEL ADMIN O EL REVISOR ASIGNADO`,
            deleteRevision.cuentaCobro.contratista
        );

        logger.info('[PRISMA] ELIMINACION DE LA REVISION EXITOSA!!!!!');
        return res.status(200).json({msg: 'ELIMINACION DE LA REVISION EXITOSA', revision: deleteRevision});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}