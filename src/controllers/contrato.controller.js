import logger from '../logs/logger.js';
import { generarNumeroContrato, enviarNotificaciones, filtrarDocumentosRequeridos } from '../utils/functions.js';
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

        const contratosConObligaciones = contratos.map(c => ({
            ...c,
            obligaciones: c.obligaciones ? JSON.parse(c.obligaciones) : []
        }));

    logger.info('[PRISMA] LISTA DE CONTRATOS!!!');
    return res.status(200).json({ msg: 'LISTA DE CONTRATOS', contrato: contratosConObligaciones });
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
        const contratoFormateado = {
            ...contrato,
            obligaciones: contrato.obligaciones ? JSON.parse(contrato.obligaciones) : []
        };

        logger.info('[PRISMA] CONTRATO ENCONTRADO!!!');
        return res.status(200).json({ msg: 'CONTRATO ENCONTRADO', contrato: contratoFormateado });
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
            valorMensual,
            fechaInicio,
            fechaFin,
            tipoContrato,
            obligaciones,
            contratistaId,
            documentosRequeridos,
        } = req.body;

        const documentosFiltrados = documentosRequeridos
        ? filtrarDocumentosRequeridos(documentosRequeridos)
        : null;

        const contrato = await prisma.contrato.create({
            data: {
                numero: await generarNumeroContrato(),
                objeto,
                valor,
                valorMensual,
                fechaInicio: new Date(fechaInicio),
                fechaFin: new Date(fechaFin),
                estado: 'ASIGNADO',
                tipoContrato,
                contratistaId,
                documentosRequeridos: documentosFiltrados,
                obligaciones: JSON.stringify(obligaciones), 
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

        await enviarNotificaciones(`CREACION DE CONTRATO # ${contrato.numero}`,
            `CONTRATO CREADO Y ASIGNADO A: ${contrato.contratista.nombre}  ${contrato.contratista.apellido}`,
            contrato.contratista
        );

        logger.info('[PRISMA] CREACION DE CONTRATO EXITOSA!!!!');
        return res.status(201).json({msg: 'CREACION DE CONTRATO EXITOSA', contrato})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updateContract = async (req, res) => {
    try {
        const { id } = req.params; // ID del contrato a actualizar
        const { contratistaId: nuevoContratistaId } = req.query;
        const archivos = req.files || []; // Asumiendo que usas multer o similar

        const contrato = await prisma.contrato.findUnique({
            where: { 
                id 
            },
            include: { 
                contratista: true,
                documentos: true
            }
        });


        if (!contrato) {
            logger.warn('[PRISMA] CONTRATO NO ENCONTRADO!!!!');
            return res.status(404).json({ msg: 'CONTRATO NO ENCONTRADO' });
        }

        // Si se proporciona contratistaId y es diferente del actual
        if (nuevoContratistaId && nuevoContratistaId !== contrato.contratistaId) {
            const contratoActualizado = await prisma.contrato.update({
                where: { 
                    id 
                },
                data: {
                    contratistaId: nuevoContratistaId,
                    fechaActualizacion: new Date(),
                    estado: 'ASIGNADO',
                },
                include: {
                    contratista: true,
                }
            });

            const contratoFormateado = {
                ...contratoActualizado,
                obligaciones: contratoActualizado.obligaciones ? JSON.parse(contratoActualizado.obligaciones) : []
            };

            await enviarNotificaciones(`ASINGNACION AL CONTRATO # ${contratoActualizado.numero}`,
                `SE HA ASIGNADO COMO NUEVO CONTRATISTA DEL CONTRATO # ${contratoActualizado.numero}, 
                POR FAVOR ACTUALIZAR LA DOCUMENTACION DEL CONTRATO`,
                contratoActualizado.contratista
            );

            await enviarNotificaciones(`CAMBIO DE ASIGNACION EN CONTRATO # ${contrato.numero}`,
                `SE HA QUITADO SU ASIGNACION DEL CONTRATO # ${contrato.numero}`,
                contrato.contratista
            );

            logger.info('[PRISMA] CONTRATISTA ASIGNADO AL CONTRATO ACTUALIZADO!!!!');
            return res.status(200).json({ msg: 'CONTRATISTA ASIGNADO AL ACTUALIZADO', contrato: contratoFormateado });
            
        }

        // Si se reciben archivos, subirlos y cambiar estado a ACTIVO
        if(req.files && req.files.length > 0){
            // Subir documentos a la tabla Documento
            const documentos = await Promise.all(req.files.map(async (file) => {
                return await prisma.documento.create({
                    data: {
                        nombre: file.originalname,
                        url: `/docs/${file.filename}`,
                        tipo: file.mimetype,
                        descripcion: req.body.descripcion || 'SIN DESCRIPCION',
                        usuario: {
                            connect: { 
                                id: user.id
                            }
                        }
                    }
                });
            }));

            if(!documentosCreados){
                logger.warn('[PRISMA] NO SE PUDIERON CARGAR LOS DOCUMENTOS!!!!');
                return res.status(400).json({msg: 'NO SE PUDIERON CARGAR LOS DOCUMENTOS'});
            }

            const contratoActualizado = await prisma.contrato.update({
                where: { id },
                data: {
                    estado: 'ACTIVO',
                    fechaActualizacion: new Date()
                },
                include: {
                    documentos: true,
                    contratista: true,
                }
            });

            await enviarNotificaciones(`ACTUALIZACION DE ESTADO DEL CONTRATO # ${contratoActualizado.numero}`,
                `SE HA ACTUALIZADO EL CONTRATO # ${contratoActualizado.numero} A PASADO DEL ESTADO ${contrato.estado} a ${contratoActualizado.estado}`,
                contratoActualizado.contratista
            );

            const contratoFormateado = {
                ...contratoActualizado,
                obligaciones: contratoActualizado.obligaciones ? JSON.parse(contratoActualizado.obligaciones) : []
            };

        // Si no se envía contratistaId ni archivos, no se hace nada
            logger.info('[PRISMA] NO HUBO CAMBIOS EN EL CONTRATO')
            return res.status(200).json({ msg: 'NO HUBO CAMBIOS EN EL CONTRATO', contrato: contratoFormateado });
        }

        logger.info('[PRISMA] NO HUBO CAMBIOS EN EL CONTRATO')
        return res.status(200).json({ msg: 'NO HUBO CAMBIOS EN EL CONTRATO', contrato });

    } catch (err) {
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
};


export const deleteContract = async (req, res) => {
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