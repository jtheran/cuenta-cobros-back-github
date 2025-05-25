import logger from '../logs/logger.js';
import { generarNumeroContrato } from '../utils/functions.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export  const getContrats = async (req, res) => {
    try{
        const filtros = {};
    // Si es contratista, filtra por su ID
        if (req.user.role === 'contratista') {
            filtros.contratistaId = req.user.id;
        }
        const contratos = await prisma.contrato.findMany({
            where: filtros,
            include: {
                contratista: true,
                cuentasCobro: true,
                documentos: true
            }
        });

        if(!contratos){
            logger.warn('[PRISMA] CONTRATOS NO ENCONTRADOS O NO EXISTEN!!!!');
            return res.status(404).json({msg: 'CONTRATOS NO ENCONTRADOS O NO EXISTEN'});
        }

        logger.info('[PRISMA] LISTA DE CONTRATOS!!!');
        return res.status(200).json({msg: 'LISTA DE CONTRATOS', contrato: contratos});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const getContractByID = async (req, res) => {
    try{
        const contratoID = req.params.id;
        const filtros = {
            id: contratoID
        };
    // Si es contratista, filtra por su ID
        if (req.user.role === 'contratista') {
            filtros.contratistaId = req.user.id;
        }

        const contrato = await prisma.contrato.findUnique({
            where: filtros,
            include: {
                contratista: true,
                cuentasCobro: true,
                documentos: true
            }
        });

        if(!contrato){
            logger.warn('[PRISMA] CONTRATO NO ENCONTRADO O NO EXISTEN!!!!');
            return res.status(404).json({msg: 'CONTRATO NO ENCONTRADO O NO EXISTEN'});
        }

        logger.info('[PRISMA] CONTRATO ENCONTRADO!!!');
        return res.status(200).json({msg: 'CONTRATO ENCONTRADO', contrato})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const createContract = async (req, res) => {
    try{
        const {
            objeto,
            valor,
            fechaInicio,
            fechaFin,
            estado,
            tipoContrato,
            contratistaId,
        } = req.body;

        const contrato = await prisma.contrato.create({
            data: {
                numero: await generarNumeroContrato(),
                objeto,
                valor,
                fechaInicio: new Date(fechaInicio),
                fechaFin: new Date(fechaFin),
                estado,
                tipoContrato,
                contratistaId,
            },
            include: {
                contratista: true,
                cuentasCobro: true,
                documentos: true
            }
        });

        if(!contrato){
            logger.warn('[PRISMA] CREACION DE CONTRATO FALLIDA!!!!');
            return res.status(404).json({msg: 'CREACION DE CONTRATO FALLIDA'});
        }

        logger.info('[PRISMA] CREACION DE CONTRATO EXITOSA!!!!');
        return res.status(201).json({msg: 'CREACION DE CONTRATO EXITOSA', contrato})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const deleteContrac = async (req, res) => {
    try{
        const contratoID = req.params.id;

        const contrato = await prisma.contrato.findUnique({
            where: {
                id: contratoID
            },
            include: {
                contratista: true,
                cuentasCobro: true,
                documentos: true
            }
        });

        if(!contrato){
            logger.warn('[PRISMA] CONTRATO NO ENCONTRADO O NO EXISTEN!!!!');
            return res.status(404).json({msg: 'CONTRATO NO ENCONTRADO O NO EXISTEN'});
        }

        const deleteContrato = await prisma.contrato.delete({
            where: {
                id: contrato.id
            }
        });

        if(!deleteContrato){
            logger.warn('[PRISMA] ELIMINACION DE CONTRATO FALLIDA!!!!');
            return res.status(404).json({msg: 'ELIMINACION DE CONTRATO FALLIDA'});
        }

        logger.info('[PRISMA] CONTRATO ELIMINADO EXITOSAMENTE!!!');
        return res.status(200).json({msg: 'CONTRATO ELIMINADO EXITOSAMENTE', contrato: deleteContrato})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}