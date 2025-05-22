import logger from '../logs/logger.js';
import path from 'path';
import fs from 'fs';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getFiles = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1)*limit;


        const [files, total] = await Promise.all([
            prisma.file.findMany({
                skip,
                take: limit,
                include: {
                    taskTest: true,
                    testCase: true,
                }
            }),
            prisma.file.count(),
        ]);

        if(!files){
            logger.warn('[PRISMA] FILES NOT FOUND!!!!');
            return rmSync.status(404).json({msg: 'FILES NOT FOUND'});
        }

        logger.info('[PRISMA] FILES FOUND!!!!!');
        return res.status(200).json({msg: 'FILES FOUND', page, pages: Math.ceil(total/limit), count: total, file: files});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const getFileById = async (req, res) => {
    try{
        const { id } = req.params;
        const file = await prisma.file.findUnique({
            where: {
                id
            },
            include: {
                taskTest: true,
                testCase: true,
            }
        });

        if(!file){
            logger.warn('[PRISMA] FILE NOT FOUND!!!!');
            return res.status(404).json({msg: 'FILE NOT FOUND'});
        }

        logger.info('[PRISMA] FILE FOUND!!!!!');
        return res.status(200).json({msg: 'FILE FOUND', file});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const uploadFile = async (req, res) => {
    try{
        const { taskTestId, testCaseId } = req.body;
        const file = req.file;

        if(!file){
            logger.warn('[PRISMA] FILE NOT FOUND!!!');
            return res.status(404).json({ msg: 'FILE NOT FOUND' });
        } 

        const newFile = await prisma.file.create({
            data: {
                name: file.originalname,
                url: `/docs/${file.filename}`,
                type: file.mimetype,
                taskTestId,
                testCaseId,
                testById: req.user.id
            }
        });

        if(!newFile){
            logger.error('[PRISMA] FILE NOT CREATED!!!');
            return res.status(400).json({ msg: 'FILE NOT CREATED' });
        }

        logger.info('[PRISMA] FILE CREATED!!!!');
        return res.status(201).json({msg: 'FILE CREATED', file: newFile });
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const deleteFile = async (req, res) => {
    try{
        const { id } = req.params;

        const file = await prisma.file.findUnique({
            where: {
                id
            }
        });

        if(!file){
            logger.warn('[PRISMA] FILE NOT FOUND!!!!');
            return res.status(404).json({msg: 'FILE NOT FOUND'});
        }

        const filepath = path.join('docs', path.basename(file.url));
        fs.unlink(filepath, (err) => {
            if(err){
                logger.warn('[FILE] No se pudo borrar el archivo físico: ', err.message);
                return res.status(400).json({msg: 'NO SE PUDO ELIMINAR ARCHIVO FISICO: '+err.message });
            } 
        });
        const deleteFile = await prisma.file.delete({
            where: {
                id
            }
        });

        if(!file){
            logger.warn('[PRISMA] FILE NOT DELETED!!!!');
            return res.status(400).json({msg: 'FILE NOT DELETED'});
        }

        logger.info('[PRISMA] FILE DELETED!!!!');
        return res.status(200).json({msg: 'FILE DELETED', file: deleteFile });
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const downloadFile = async (req, res) => {
    try{
        const { id } = req.params;
        const file = await prisma.file.findUnique({ 
            where: {
                    id 
            } 
        });
        if(!file){
            logger.warn('[PRISMA] FILE NOT FOUND!!!!');
            return res.status(404).json({msg: 'FILE NOT FOUND'});
        } 

        const filepath = path.join('docs', path.basename(file.url));
        logger.info('[FILE] FILE DONWLOAD!!!');
        return res.status(200).download(filepath, file.name);
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
};