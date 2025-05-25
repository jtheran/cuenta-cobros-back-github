import logger from '../logs/logger.js';
import { generarNumeroCuenta, calcularPorcentajeEjecucion } from '../utils/functions.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getCuentas = async (req, res) => {
    try{
        const filtros = {};
    // Si es contratista, filtra por su ID
        if (req.user.role === 'contratista') {
            filtros.contratistaId = req.user.id;
        }

        const cuentas = await prisma.cuentaCobro.findMany({
            where: filtros,
            include: {
                contratista: true,
                contrato: true,
                revisiones: true,
                documentos: true,
                pago: true
            }
        });

        if(!cuentas){
            logger.warn('[PRISMA] CUENTAS DE COBRO NO ENCONTRADAS O NO EXISTEN!!!!!');
            return res.status(404).json({msg: 'CUENTAS DE COBRO NO ENCONTRADAS O NO EXISTEN'});
        }

        logger.info('[PRISMA] LISTA DE CUENTAS ENCONTRADAS!!!!');
        return res.status(200).json({msg: 'LISTA DE CUENTAS ENCONTRADAS', cuenta: cuentas});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const getCuentaByID = async (rrq, res) => {
    try{
        
        const cuentaID = req.params.id;
        const filtros = {
            id: cuentaID
        };

        if (req.user.role === 'contratista') {
            filtros.contratistaId = req.user.id;
        }

        const cuenta = await prisma.cuentaCobro.findUnique({
            where: filtros,
            include: {
                contratista: true,
                contrato: true,
                revisiones: true,
                documentos: true,
                pago: true
            }
        });

        if(!cuenta){
            logger.warn('[PRISMA] CUENTA NO ENCONTRADA!!!');
            return res.status(404).json({msg: 'CUENTA NO ENCONTRADA'});
        }

        logger.info('[PRISMA] CUENTA ENCONTRADA EXITOSAMENTE!!!!');
        return res.status(200).json({msg: 'CUENTA ENCONTRADA EXITOSAMENTE', cuenta});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}