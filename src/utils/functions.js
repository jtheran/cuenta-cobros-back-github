import logger from '../logs/logger.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const generarNumeroContrato = async () => {
    const añoActual = new Date().getFullYear();

    const ultimaCuenta = await prisma.contrato.findFirst({
        where: {
            numero: {
                startsWith: `CT-${añoActual}`
            }
        },
        orderBy: {
            numero: 'desc'
        }
    });

    let nuevoConsecutivo = 1;

    if (ultimaCuenta) {
        logger.info('[PRISMA] ULTIMO CONTRATO CREADO ENCONTRADO!!!!!')
        const partes = ultimaCuenta.numero.split('-');
        const ultimoNumero = parseInt(partes[2]);
        nuevoConsecutivo = ultimoNumero + 1;
    }

    logger.info('[SERVER] NUMERO DE CONTRATO UNICO GENERADO AUTOMATICAMENTE!!!!!')
    const numeroFormateado = String(nuevoConsecutivo).padStart(4, '0');
    return `CT-${añoActual}-${numeroFormateado}`;
};

export const generarNumeroCuenta = async () => {
    const añoActual = new Date().getFullYear();

    const ultimaCuenta = await prisma.cuentaCobro.findFirst({
        where: {
            numero: {
                startsWith: `CC-${añoActual}`
            }
        },
        orderBy: {
            numero: 'desc'
        }
    });

    let nuevoConsecutivo = 1;

    if (ultimaCuenta) {
        logger.info('[PRISMA] ULTIMA CUENTA DE COBRO CREADA ENCONTRADA!!!!!')
        const partes = ultimaCuenta.numeroCuenta.split('-');
        const ultimoNumero = parseInt(partes[2]);
        nuevoConsecutivo = ultimoNumero + 1;
    }

    logger.info('[SERVER] NUMERO DE CUENTA DE COBRO UNICO GENERADO AUTOMATICAMENTE!!!!!')
    const numeroFormateado = String(nuevoConsecutivo).padStart(4, '0');
    return `CC-${añoActual}-${numeroFormateado}`;
};

export const calcularPorcentajeEjecucion = (periodoInicio, periodoFin) => {
    const inicio = new Date(periodoInicio);
    const fin = new Date(periodoFin);
    const hoy = new Date();

    if (hoy <= inicio){
        logger.info('[SERVER] PROCENTAJE DE EJECUCION DEL CONTRATO ES: 0%');
        return 0;
    }

    if (hoy >= fin){
        logger.info('[SERVER] PROCENTAJE DE EJECUCION DEL CONTRATO ES: 0%');
        return 100;
    }

    const totalTiempo = fin.getTime() - inicio.getTime();
    const tiempoTranscurrido = hoy.getTime() - inicio.getTime();

    const porcentaje = (tiempoTranscurrido / totalTiempo) * 100;
    logger.info(`[SERVER] PORCENTAJE DE EJECUCCION ES: ${porcentaje}%`);
    return Math.round(porcentaje); 
};

