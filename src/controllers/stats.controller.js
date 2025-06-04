import logger from '../logs/logger.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const statsAdmin = async (req, res) => {
    try{
        let stats = {};

        const statsUser = await prisma.$transaction([
            prisma.contrato.count(),
            prisma.usuario.count(),
            prisma.cuentaCobro.count()
        ]);

        if(!stats){
            logger.warn('[PRISMA] STATS NO OBTENIDOS!!!!');
            return res.status(400).json({msg: 'STATS NO OBTENIDOS'});
        }else{
            stats.contratos = statsUser[0]
            stats.users = statsUser[1]
            stats.cuentas = statsUser[2]
        }

        logger.info('[PRISMA] STATS OBTENIDOS!!!');
        return res.status(200).json({msg: 'STATS OBTENIDOS', stats});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
}

export const statsContratista = async (req, res) => {
  try {
    const filtros = {};
    let stats = {};

    if (req.user.role === 'contratista') {
      filtros.contratistaId = req.user.id;
    }

    const statsUser = await prisma.$transaction([
      prisma.contrato.count({
        where: {
          contratistaId: filtros.contratistaId,  // ✅ Campo correcto
          estado: 'ACTIVO',
        },
      }),
      prisma.cuentaCobro.count({
        where: {
          contratistaId: filtros.contratistaId,  // ✅ Campo correcto
          estado: 'RADICADA',
        },
      }),
      prisma.cuentaCobro.count({
        where: {
          contratistaId: filtros.contratistaId,
          estado: 'APROBADA',
        },
      }),
      prisma.cuentaCobro.count({
        where: {
          contratistaId: filtros.contratistaId,
          estado: 'RECHAZADA',
        },
      }),
    ]);

    stats.contratos = statsUser[0];
    stats.cuentasRadicadas = statsUser[1];
    stats.cuentasAprobadas = statsUser[2];
    stats.cuentasRechazadas = statsUser[3];

    logger.info('[PRISMA] STATS OBTENIDOS!!!');
    return res.status(200).json({ msg: 'STATS OBTENIDOS', stats });
  } catch (err) {
    logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
    return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
  }
};


export const statsRevisor = async (req, res) => {
    try{
        const filtros = {};
        let stats = {};

        if (req.user.role === 'revisor') {
            filtros.revisorId = req.user.id;
        }

        const statsUser = await prisma.$transaction([
            prisma.cuentaCobro.count({
                where: {
                    estado: 'RADICADA',
                }
            }),
            prisma.cuentaCobro.count({
                where: {
                    estado: 'APROBADA',
                }
            }),
            prisma.cuentaCobro.count({
                where: {
                    estado: 'RECHAZADA',
                }
            }),
            prisma.cuentaCobro.count(),
            prisma.revision.count({
                where: {
                    revisorId: filtros.revisorId,
                },
            })
        ]);

        if(!stats){
            logger.warn('[PRISMA] STATS NO OBTENIDOS!!!!');
            return res.status(400).json({msg: 'STATS NO OBTENIDOS'});
        }else{
            stats.cuentasRadicadas = statsUser[0]
            stats.cuentasAprobadas = statsUser[1]
            stats.cuentasRechazadas = statsUser[2]
            stats.cuentas = statsUser[3]
            stats.revisiones = statsUser[4]
        }

        logger.info('[PRISMA] STATS OBTENIDOS!!!');
        return res.status(200).json({msg: 'STATS OBTENIDOS', stats});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
}

export const statsFinanciero = async (req, res) => {
    try{
        const filtros = {};
        let stats = {};

        if (req.user.role === 'financiero') {
            filtros.financieroId = req.user.id;
        }

        const statsUser = await prisma.$transaction([
            prisma.cuentaCobro.count({
                where: {
                    estado: 'PAGADA',
                }
            }),
            prisma.cuentaCobro.count({
                where: {
                    estado: 'APROBADA',
                }
            }),
            prisma.cuentaCobro.count({
                where: {
                    estado: 'RECHAZADA',
                }
            }),
            prisma.cuentaCobro.count(),
            prisma.pago.count({
                where: {
                    financieroId: filtros.financieroId,
                },
            })
        ]);

        if(!stats){
            logger.warn('[PRISMA] STATS NO OBTENIDOS!!!!');
            return res.status(400).json({msg: 'STATS NO OBTENIDOS'});
        }else{
            stats.cuentasRadicadas = statsUser[0]
            stats.cuentasAprobadas = statsUser[1]
            stats.cuentasRechazadas = statsUser[2]
            stats.cuentas = statsUser[3]
            stats.pagos = statsUser[4]
        }

        logger.info('[PRISMA] STATS OBTENIDOS!!!');
        return res.status(200).json({msg: 'STATS OBTENIDOS', stats});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: ' + err.message);
        return res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
    }
}