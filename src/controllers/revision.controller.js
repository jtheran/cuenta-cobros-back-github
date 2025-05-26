import logger from '../logs/logger.js';
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
        const estado = 'INICIADA';
        const {
            cuentaCobroId,
        } = req.body;

        const revision = await prisma.revision.create({
            data: {
                cuentaCobroId,
                estado,
                revisorId: revisorID,
            }
        });

        if(!revision){
            logger.warn('[PRISMA] CREACION DE REVISION FALLIDA!!!');
            return res.status(400).json({msg: 'CREACION DE REVISION FALLIDA'});
        }

        logger.info('[PRISMA] CREACION DE REVISION EXITOSA!!!');
        return res.status(200).json({msg: 'CREACION DE REVISION EXITOSA', revision});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updateRevision = async (req, res) => {
    try{
        const revisionID = req.params.id;
        const estado = 'REVISADA';
        const {
            observaciones,
            estadoCuenta,
        } = req.body;

        const revision = await prisma.revision.findUnique({
            where: {
                id: revisionID,
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
                    estado
                }
            }),
            prisma.cuentaCobro.update({
                where: {
                    id: revision.cuentaCobroId,
                },
                data: {
                    estado: estadoCuenta,
                }
            })
        ]);

        if(!updateRevision){
            logger.warn('[PRISMA] ACTUALIZACION DE REVISION FALLIDA!!!!');
            return res.status(400).json({msg: 'ACTUALIZACION DE REVISION FALLIDA'});
        }

        logger.info('[PRISMA] ACTUALIZACION DE REVISION Y CUANTA DE COBRO EXITOSA!!!!');
        return res.status(200).json({msg: 'ACTUALIZACION DE REVISION Y CUENTA DE COBRO EXITOSA', revision: updateRevision[0]});
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
            }
        });

        if(!deleteRevision){
            logger.warn('[PRISMA] REVISION NO ELIMINADA CORRECTAMENTE!!!!');
            return res.status(400).json({msg: 'REVISION NO ELIMINADA CORRECTAMENTE'});
        }

        logger.info('[PRISMA] ELIMINACION DE LA REVISION EXITOSA!!!!!');
        return res.status(200).json({msg: 'ELIMINACION DE LA REVISION EXITOSA', revision: deleteRevision});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}