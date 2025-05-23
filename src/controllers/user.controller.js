import logger from '../logs/logger.js';
import { encryptPass } from '../libs/bcrypt.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getUsers = async (req, res ) => {
    try{
        const users = await prisma.usuario.findMany();

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
        const { 
            nombre, 
            apellido, 
            email, 
            password, 
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

        const hashPassword = await encryptPass(password);

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
            }
        });

        if(!user){
            logger.warn('[PRISMA] CREACION DE USUARIO FALLADA!!!!');
            return res.status(400).json({msg: 'CREACION DE USUARIO FALLADA'});
        }

        logger.info('[PRISMA] USUARIO CREADO EXITOSAMENTE!!!!!');
        return res.status(201).json({msg: 'USUARIO CREADO EXITOSAMENTE', user});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const updateUser = async (req, res) => {
    try{
        const { id } = req.params;
        const { 
            nombre, 
            apellido,
            email,
            documentoIdentidad, 
            tipoDocumento, 
            telefono = null
        } = req.body;

        const user = await prisma.usuario.findUnique({
            where: {
                id
            }
        });

        if(!user){
            logger.warn('[PRISMA] USUARIO NO ENCONTRADO O NO EXISTE!!!!');
            return res.status(404).json({msg: 'USUARIO NO ENCONTRADO O NO EXISTE'});
        }

        const verifyEmail = await prisma.usuario.findUnique({
            where: {
                email
            }
        });

        if(verifyEmail){
            logger.warn('[PRISMA] EMAIL YA SE ENCUENTRA REGISTRADO!!!!');
            return res.status(400).json({msg: 'EMAIL YA SE ENCUENTRA REGISTRADO'});
        }

        const updateUser = await prisma.usuario.update({
            where: {
                id
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

        if(!updateUser){
            logger.warn('[PRISMA] ACTUALIZACION DE DATOS DEL USUARIO FALLADA!!!!');
            return res.status(404).json({msg: 'ACTUALIZACION DE DATOS DEL USUARIO FALLADA'});
        }

        logger.info('[PRISMA] DATOS DEL USUARIO ACTUALIZADO EXITOSAMENTE!!!!!');
        return res.status(200).json({msg: 'DATOS DEL USUARIO ACTUALIZADO EXITOSAMENTE', user: updateUser})
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

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