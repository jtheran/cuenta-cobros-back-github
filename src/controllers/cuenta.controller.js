import logger from '../logs/logger.js';
import { generarNumeroCuenta } from '../utils/functions.js';
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

        if (req.user.role === 'revisor') {
            filtros.estado = 'RADICADA';
        }

        if (req.user.role === 'financiero') {
            filtros.estado = 'APROBADA';
        }

        const cuentas = await prisma.cuentaCobro.findMany({
            where: filtros,
            include: {
                contratista: true,
                contrato: true,
                revisiones: true,
                documentos: true,
                pagos: true
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

export const getCuentaByID = async (req, res) => {
    try{
        
        const cuentaID = req.params.id;
        const filtros = {
            id: cuentaID
        };

        if (req.user.role === 'contratista') {
            filtros.contratistaId = req.user.id;
        }

        if (req.user.role === 'revisor') {
            filtros.estado = 'RADICADA';
        }

        if (req.user.role === 'financiero') {
            filtros.estado = 'APROBADA';
        }

        const cuenta = await prisma.cuentaCobro.findUnique({
            where: filtros,
            include: {
                contratista: true,
                contrato: true,
                revisiones: true,
                documentos: true,
                pagos: true
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

export const createCuenta = async (req, res) => {
    try{
        const {
            valor,
            periodoInicio,
            periodoFin,
            contratistaId,
            contratoId,
            descripcion,
            datosBancarios,
        } = req.body;

        const cuenta = await prisma.cuentaCobro.create({
            data: {
                valor,
                periodoFin: new Date(periodoFin),
                periodoInicio: new Date(periodoInicio),
                contratistaId,
                contratoId,
                descripcionActividades: descripcion,
                numeroCuenta: await generarNumeroCuenta(),
                datosBancarios,
            },
            include: {
                contratista: true,
                contrato: true,
                revisiones: true,
                documentos: true,
                pagos: true
            }
        });

        if(!cuenta){
            logger.warn('[PRISMA] CREACION DE CUENTA DE COBRO FALLIDA!!!!!');
            return res.status(400).json({msg: 'CREACION DE CUENTA DE COBRO FALLIDA'});
        }

        logger.info('[PRISMA] CREACION DE CUENTA DE COBRO EXITOSA!!!!');
        return res.status(202).json({msg: 'CREACION DE CUENTA DE COBRO EXITOSA', cuenta});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updateCuenta = async (req, res) => { 
    try{
        const cuentaID = req.params.id;
        const estado = 'RADICADA';

        if (!req.files || req.files.length === 0) {
            logger.warn('[PRISMA] NO SE HAN CARGADO LOS ARCHIVOS NECESARIOS!!!!!')
            return res.status(400).json({ msg: 'NO SE HAN CARGADO LOS ARCHIVOS NECESARIOS'});
        }

        const cuenta = await prisma.cuentaCobro.findUnique({
            where: {
                id: cuentaID
            }
        });
        
        if(!cuenta){
            logger.warn('[PRISMA] CUENTA NO ENCONTRADA!!!');
            return res.status(404).json({msg: 'CUENTA NO ENCONTRADA'});
        }

        const documentosData = req.files.map(file => ({
            nombre: file.originalname,
            tipo: file.mimetype,
            url: `/docs/${file.filename}`,
            cuentaCobroId: cuenta.id,
            descripcion: req.body.descripcion || 'SIN DESCRIPCION',
        }));

        const updateCuenta = await prisma.$transaction([
            prisma.documento.createMany({ 
                data: documentosData
            }),
            prisma.cuentaCobro.update({
                where: { 
                    id: cuentaID
                },
                data: { 
                    estado,
                    fechaRadicacion: new Date(),
                }
            })
        ]);

        if(!updateCuenta){
            logger.warn('[PRISMA] ACTUALIZACION DE CUENTA DE COBRO FALLIDA!!!!!');
            return res.status(400).json({msg: 'ACTUALIZACION DE CUENTA DE COBRO FALLIDA'});
        }
        
        logger.info('[PRISMA] ACTUALIZACION DE CUENTA DE COBRO EXITOSA!!!!');
        return res.status(202).json({msg: 'ACTUALIZACION DE CUENTA DE COBRO EXITOSA', cuenta: updateCuenta[1]});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const deleteCuenta = async (req, res) => {
    try{
        const cuentaID = req.params.id;

        const cuenta = await prisma.cuentaCobro.findUnique({
            where: {
                id: cuentaID,
            }
        });
        
        if(!cuenta){
            logger.warn('[PRISMA] CUENTA NO ENCONTRADA!!!');
            return res.status(404).json({msg: 'CUENTA NO ENCONTRADA'});
        }

        const deleteCuenta = await prisma.$transaction([
            // 1. Eliminar documentos relacionados
            prisma.documento.deleteMany({
                where: { cuentaCobroId: cuentaID }
            }),
            // 2. Eliminar la cuenta de cobro
            prisma.cuentaCobro.delete({
                where: { id: cuentaID }
            })
        ]);

        if(!deleteCuenta){
            logger.warn('[PRISMA] ELIMINACION DE CUENTA DE COBRO FALLIDA!!!');
            return res.status(400).json({msg: 'ELIMINACION DE CUENTA DE COBRO FALLIDA'});
        }

        logger.info('[PRISMA] ELIMINACION DE CUENTA DE COBRO EXITOSA!!!');
        return res.status(200).json({msg: 'ELIMINACION DE CUENTA DE COBRO EXITOSA', cuenta: deleteCuenta[1]});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}