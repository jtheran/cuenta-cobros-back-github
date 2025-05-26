import logger from '../logs/logger.js';
import { generarNumeroContrato, enviarNotificaciones } from '../utils/functions.js';
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

        await enviarNotificaciones(`CREACION DE CONTRATO # ${contrato.numero}`, `CONTRATO CREADO Y ASIGNADO A: ${contrato.contratista.nombre}  ${contrato.contratista.apellido}`, contrato.contratista);

        logger.info('[PRISMA] CREACION DE CONTRATO EXITOSA!!!!');
        return res.status(201).json({msg: 'CREACION DE CONTRATO EXITOSA', contrato})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updateContract = async (req, res) => { 
    try{
        const contratoID = req.params.id;

        if (!req.files || req.files.length === 0) {
            logger.warn('[PRISMA] NO SE HAN CARGADO LOS ARCHIVOS NECESARIOS!!!!!')
            return res.status(400).json({ msg: 'NO SE HAN CARGADO LOS ARCHIVOS NECESARIOS'});
        }

        const contrato = await prisma.contrato.findUnique({
            where: {
                id: contratoID,
            }
        });
        
        if(!contrato){
            logger.warn('[PRISMA] CONTRATO NO ENCONTRADA!!!');
            return res.status(404).json({msg: 'CONTRATO NO ENCONTRADA'});
        }

        const documentosData = req.files.map(file => ({
            nombre: file.originalname,
            tipo: file.mimetype,
            url: `/docs/${file.filename}`,
            contratoId: contratoID,
            descripcion: req.body.descripcion || 'SIN DESCRIPCION',
        }));

        const updateContrato = await prisma.$transaction([
            prisma.documento.createMany({ data: documentosData }),
            prisma.contrato.update({
                where: { 
                    id: contrato.id,
                },
                data: { 
                    estado: 'ACTIVO',
                },
                include: {
                    contratista: true,
                    cuentasCobro: true,
                    documentos: true
                }
            })
        ]);

        if(!updateContrato){
            logger.warn('[PRISMA] ACTUALIZACION DE CUENTA DE COBRO FALLIDA!!!!!');
            return res.status(400).json({msg: 'ACTUALIZACION DE CUENTA DE COBRO FALLIDA'});
        }

        await enviarNotificaciones(`CONTRATO # ${updateContrato[1].numero} ACTUALIZADO DE ESTADO`, `CONTRATO A PASADO DE ESTADO ${contrato.estado} a ${updateContrato[1].estado}`, updateContrato[1].contratista);
        
        logger.info('[PRISMA] ACTUALIZACION DE CUENTA DE COBRO EXITOSA!!!!');
        return res.status(202).json({msg: 'ACTUALIZACION DE CUENTA DE COBRO EXITOSA', contrato: updateContrato[1]});
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
            },
            include: {
                contratista: true,
                cuentasCobro: true,
                documentos: true
            }
        });

        if(!deleteContrato){
            logger.warn('[PRISMA] ELIMINACION DE CONTRATO FALLIDA!!!!');
            return res.status(404).json({msg: 'ELIMINACION DE CONTRATO FALLIDA'});
        }

        await enviarNotificaciones(`SE HA ELIMINADO EL CONTRATO # ${deleteContrato.numero}`, `EL CONTRATO HA SIDO ELIMINADO POR PARTE DEL ADMIN DE LA PLATAFORMA`, deleteContrato.contratista);

        logger.info('[PRISMA] CONTRATO ELIMINADO EXITOSAMENTE!!!');
        return res.status(200).json({msg: 'CONTRATO ELIMINADO EXITOSAMENTE', contrato: deleteContrato})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}