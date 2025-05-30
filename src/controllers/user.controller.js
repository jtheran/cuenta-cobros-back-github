import logger from '../logs/logger.js';
import { sendEmail } from '../services/nodemailer.js';
import { generarPasswordSegura } from '../utils/functions.js';
import { encryptPass } from '../libs/bcrypt.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getUsers = async (req, res ) => {
    try{

        const { role } = req.query; // ✅ leer de query params
        let filtros = {};

        if (role) {
            filtros = { role }; // 🔍 aplicar filtro por rol si se envía
        }

        const users = await prisma.usuario.findMany({
            where: filtros,
            include: {
                contratos: true,
                cuentasCobro: true,
                revisiones: true,
                pagos: true,
            }
        });

        if(!users){
            logger.warn('[PRISMA] USUARIOS NO ENCONTRADOS O NO EXISTEN!!!!');
            return res.status(404).json({msg: 'USUARIOS NO ENCONTRADOS O NO EXISTEN'});
        }

        logger.info('[PRISMA] LISTA DE USUARIOS!!!');
        return res.status(200).json({msg: 'LISTA DE USUARIOS', user: users});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const getUserByID = async (req, res ) => {
    try{
        const { id } = req.params;

        const user = await prisma.usuario.findUnique({
            where: {
                id
            },
            include: {
                contratos: true,
                cuentasCobro: true,
                revisiones: true,
                pagos: true,
                documentos: true,
            }
        });

        if(!user){
            logger.warn('[PRISMA] USUARIO NO ENCONTRADO O NO EXISTE!!!!');
            return res.status(404).json({msg: 'USUARIO NO ENCONTRADO O NO EXISTE'});
        }

        logger.info('[PRISMA] USUARIO ENCONTRADO!!!!');
        return res.status(200).json({msg: 'USUARIO ENCONTRADO', user})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const createUser = async (req, res) => {
    try{
        const pass = generarPasswordSegura();
        const { 
            nombre, 
            apellido, 
            email, 
            role, 
            documentoIdentidad, 
            tipoDocumento, 
            telefono = null
        } = req.body;

        const verifyEmail = await prisma.usuario.findUnique({
            where: {
                email
            }
        });

        if(verifyEmail){
            logger.warn('[PRISMA] EMAIL YA SE ENCUENTRA REGISTRADO!!!!');
            return res.status(400).json({msg: 'EMAIL YA SE ENCUENTRA REGISTRADO'});
        }

        const hashPassword = await encryptPass(pass);

        const user = await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                email,
                tipoDocumento,
                documentoIdentidad,
                telefono,
                role,
                password: hashPassword,
            },
            include: {
                contratos: true,
                cuentasCobro: true,
                revisiones: true,
                pagos: true,
            }
        });

        if(!user){
            logger.warn('[PRISMA] CREACION DE USUARIO FALLADA!!!!');
            return res.status(400).json({msg: 'CREACION DE USUARIO FALLADA'});
        }else{
            logger.info('[EMAIL] ENVIANDO CORREO DE BIENVENIDA!!!');
            await sendEmail(user.email, 
                `BIENVENIDO A LA PLATAFORMA DE CUENTAS DE COBROS LSVCONTRACTPAY!!!!`,
                `SE HA CREADO UN USUARIO NUEVO, PARA SU ACCESO A LA PLATAFORMA SU CREDENCIALES SON LAS SIGUIENTES: <br>
                - UUSARIO = ${user.email} <br>
                - PASSWORD = ${pass} <br>`,
                `${user.nombre} ${user.apellido}`
            );
        }

        logger.info('[PRISMA] USUARIO CREADO EXITOSAMENTE!!!!!');
        return res.status(201).json({msg: 'USUARIO CREADO EXITOSAMENTE', user});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            apellido,
            email,
            documentoIdentidad,
            tipoDocumento,
            telefono = null
        } = req.body;

        const user = await prisma.usuario.findUnique({ where: { id } });

        if (!user) {
            logger.warn('[PRISMA] USUARIO NO ENCONTRADO O NO EXISTE!!!!');
            return res.status(404).json({ msg: 'USUARIO NO ENCONTRADO O NO EXISTE' });
        }

        const verifyEmail = await prisma.usuario.findUnique({ where: { email } });

        if (verifyEmail && verifyEmail.id !== id) {
            logger.warn('[PRISMA] EMAIL YA SE ENCUENTRA REGISTRADO!!!!');
            return res.status(400).json({ msg: 'EMAIL YA SE ENCUENTRA REGISTRADO' });
        }

        // 1. Actualizamos datos del usuario
        const updateUser = await prisma.usuario.update({
            where: { 
                id: user.id
            },
            data: {
                nombre,
                apellido,
                email,
                tipoDocumento,
                documentoIdentidad,
                telefono,
            }
        });

        // 2. Procesamos archivos si existen
        if(req.files && req.files.length > 0){
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

            logger.info(`[PRISMA] ${documentos.length} DOCUMENTOS CARGADOS PARA EL USUARIO`);
        }

        logger.info('[PRISMA] DATOS DEL USUARIO ACTUALIZADO EXITOSAMENTE!!!!!');
        return res.status(200).json({ msg: 'DATOS DEL USUARIO ACTUALIZADO EXITOSAMENTE', user: updateUser });

    } catch (err) {
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
};

export const deleteUser = async (req, res ) => {
    try{
        const { id } = req.params;

        const user = await prisma.usuario.findUnique({
            where: {
                id
            }
        });

        if(!user){
            logger.warn('[PRISMA] USUARIO NO ENCONTRADO O NO EXISTE!!!!');
            return res.status(404).json({msg: 'USUARIO NO ENCONTRADO O NO EXISTE'});
        }

        const deleteUser = await prisma.usuario.delete({
            where: {
                id: user.id
            }
        });

        if(!deleteUser){
            logger.warn('[PRISMA] USUARIO NO ELIMINADO!!!!');
            return res.status(404).json({msg: 'USUARIO NO ELIMINADO'});
        }

        logger.info('[PRISMA] USUARIO ELIMINADO EXITOSAMENTE!!!!');
        return res.status(200).json({msg: 'USUARIO ELIMINADO EXITOSAMENTE', user})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}