import logger from '../logs/logger.js';
import { generarNumeroCuenta, enviarNotificaciones } from '../utils/functions.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getCuentas = async (req, res) => {
    try {
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
                contratista: {
                    include: {
                        documentos: true,
                    }
                },
                contrato: {
                    include: {
                        documentos: true
                    }
                },
                revisiones: true,
                documentos: true,
                pagos: true
            }
        });
        cuentas
        if (!cuentas) {
            logger.warn('[PRISMA] CUENTAS DE COBRO NO ENCONTRADAS O NO EXISTEN!!!!!');
            return res.status(404).json({ msg: 'CUENTAS DE COBRO NO ENCONTRADAS O NO EXISTEN' });
        }

        logger.info('[PRISMA] LISTA DE CUENTAS ENCONTRADAS!!!!');
        return res.status(200).json({ msg: 'LISTA DE CUENTAS ENCONTRADAS', cuenta: cuentas });
    } catch (err) {
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
}

export const getCuentaByID = async (req, res) => {
    try {

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
                contratista: {
                    include: {
                        documentos: true,
                    }
                },
                contrato: {
                    include: {
                        documentos: true
                    }
                },
                revisiones: true,
                documentos: true,
                pagos: true
            }
        });

        if (!cuenta) {
            logger.warn('[PRISMA] CUENTA NO ENCONTRADA!!!');
            return res.status(404).json({ msg: 'CUENTA NO ENCONTRADA' });
        }

        logger.info('[PRISMA] CUENTA ENCONTRADA EXITOSAMENTE!!!!');
        return res.status(200).json({ msg: 'CUENTA ENCONTRADA EXITOSAMENTE', cuenta });
    } catch (err) {
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
}

export const createCuenta = async (req, res) => {
    try {
        const {
            valor,
            periodoInicio,
            periodoFin,
            contratistaId,
            contratoId,
            descripcion,
            datosBancarios,
        } = req.body;

        // Check if req.files exists and is an array with content
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            logger.warn('[SERVER] INTENTO DE CREACION DE CUENTA SIN ARCHIVOS ADJUNTOS. req.files:', req.files); // Log req.files to debug
            return res.status(400).json({ msg: 'Debe adjuntar al menos un archivo para radicar la cuenta.' });
        }

        const contrato = await prisma.contrato.findUnique({
            where: {
                id: contratoId,
            },
            select: {
                id: true,
                documentosRequeridos: true,
                contratista: true,
            }
        });

        if (!contrato) {
            logger.warn(`[PRISMA] Contrato con ID ${contratoId} no encontrado.`);
            return res.status(404).json({ msg: 'Contrato no encontrado.' });
        }

        let parsedDatosBancarios;
        try {
            parsedDatosBancarios = typeof datosBancarios === 'string' ? JSON.parse(datosBancarios) : datosBancarios;
        } catch (parseError) {
            logger.error('[SERVER] Error al parsear datosBancarios: ' + parseError.message);
            return res.status(400).json({ msg: 'Formato de datos bancarios inválido.' });
        }

        const cuenta = await prisma.cuentaCobro.create({
            data: {
                valor: parseFloat(valor),
                periodoFin: new Date(periodoFin),
                periodoInicio: new Date(periodoInicio),
                contratistaId,
                contratoId,
                descripcionActividades: descripcion,
                numeroCuenta: await generarNumeroCuenta(),
                datosBancarios: parsedDatosBancarios,
                estado: 'RADICADA',
                documentosRequeridos: contrato.documentosRequeridos,
            },
            include: {
                contratista: {
                    include: {
                        documentos: true,
                    }
                },
                contrato: {
                    include: {
                        documentos: true
                    }
                },
                revisiones: true,
                documentos: true,
                pagos: true,
            }
        });

        if (!cuenta) {
            logger.warn('[PRISMA] CREACION DE CUENTA DE COBRO FALLIDA!!!!!');
            return res.status(400).json({ msg: 'CREACION DE CUENTA DE COBRO FALLIDA' });
        }

        // Prepare data for documents from req.files array
        const documentosData = req.files.map(file => ({
            nombre: file.originalname,
            tipo: file.mimetype,
            url: `/uploads/${file.filename}`, // Ensure this path matches your Multer destination
            cuentaCobroId: cuenta.id,
            // When using upload.array, you might not have specific field names
            // You might need to infer the document type (e.g., from originalname)
            // or add a hidden input in the frontend for each file to specify its type.
            // For now, we'll use a generic description.
            descripcion: `Documento adjunto: ${file.originalname}`,
        }));

        if (documentosData.length > 0) {
            await prisma.documento.createMany({
                data: documentosData,
            });
        }

        await enviarNotificaciones(
            `CREACION DE CUENTA DE COBRO # ${cuenta.numeroCuenta}`,
            `SE HA CREADO LA CUENTA DE COBRO CON # ${cuenta.numeroCuenta} EN ESTADO DE ${cuenta.estado}`,
            contrato.contratista
        );

        logger.info('[PRISMA] CREACION DE CUENTA DE COBRO EXITOSA!!!!');
        return res.status(201).json({ msg: 'CREACION DE CUENTA DE COBRO EXITOSA', cuenta });

    } catch (err) {
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
};

export const updateCuenta = async (req, res) => {
    try {
        const cuentaID = req.params.id;
        const estado = 'RADICADA';

        if (!req.files || req.files.length === 0) {
            logger.warn('[PRISMA] NO SE HAN CARGADO LOS ARCHIVOS NECESARIOS!!!!!')
            return res.status(400).json({ msg: 'NO SE HAN CARGADO LOS ARCHIVOS NECESARIOS' });
        }

        const cuenta = await prisma.cuentaCobro.findUnique({
            where: {
                id: cuentaID
            }
        });

        if (!cuenta) {
            logger.warn('[PRISMA] CUENTA NO ENCONTRADA!!!');
            return res.status(404).json({ msg: 'CUENTA NO ENCONTRADA' });
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
                },
                include: {
                    contratista: true,
                    contrato: true,
                    revisiones: true,
                    documentos: true,
                    pagos: true
                }
            })
        ]);

        if (!updateCuenta) {
            logger.warn('[PRISMA] ACTUALIZACION DE CUENTA DE COBRO FALLIDA!!!!!');
            return res.status(400).json({ msg: 'ACTUALIZACION DE CUENTA DE COBRO FALLIDA' });
        } else {

            await enviarNotificaciones(`ACTUALIZACION DEL ESTADO DE LA CUENTA # ${updateCuenta[1].numeroCuenta}`,
                `SE HA ACTUALIZADO LA CUENTA DE COBRO # ${updateCuenta[1].numeroCuenta} DE ESTADO ${cuenta.estado} a ${updateCuenta[1].estado}`,
                updateCuenta[1].contratista
            );
        }

        logger.info('[PRISMA] ACTUALIZACION DE CUENTA DE COBRO EXITOSA!!!!');
        return res.status(202).json({ msg: 'ACTUALIZACION DE CUENTA DE COBRO EXITOSA', cuenta: updateCuenta[1] });
    } catch (err) {
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
}

export const deleteCuenta = async (req, res) => {
    try {
        const cuentaID = req.params.id;

        const cuenta = await prisma.cuentaCobro.findUnique({
            where: {
                id: cuentaID,
            }
        });

        if (!cuenta) {
            logger.warn('[PRISMA] CUENTA NO ENCONTRADA!!!');
            return res.status(404).json({ msg: 'CUENTA NO ENCONTRADA' });
        }

        const deleteCuenta = await prisma.$transaction([
            // 1. Eliminar documentos relacionados
            prisma.documento.deleteMany({
                where: { cuentaCobroId: cuentaID }
            }),
            // 2. Eliminar la cuenta de cobro
            prisma.cuentaCobro.delete({
                where: {
                    id: cuentaID
                },
                include: {
                    contratista: true,
                    contrato: true,
                    revisiones: true,
                    documentos: true,
                    pagos: true
                }
            })
        ]);

        if (!deleteCuenta) {
            logger.warn('[PRISMA] ELIMINACION DE CUENTA DE COBRO FALLIDA!!!');
            return res.status(400).json({ msg: 'ELIMINACION DE CUENTA DE COBRO FALLIDA' });
        }

        await enviarNotificaciones(`SE HA ELIMINADO LA CUENTA DE COBRO # ${deleteCuenta[1].numeroCuenta}`,
            `SE ELIMINO LA CUENTA DE COBRO CON # ${deleteCuenta[1].numeroCuenta} POR PARTE DEL ADMIN DE LA PLATAFORMA`,
            deleteCuenta[1].contratista
        );

        logger.info('[PRISMA] ELIMINACION DE CUENTA DE COBRO EXITOSA!!!');
        return res.status(200).json({ msg: 'ELIMINACION DE CUENTA DE COBRO EXITOSA', cuenta: deleteCuenta[1] });
    } catch (err) {
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
}