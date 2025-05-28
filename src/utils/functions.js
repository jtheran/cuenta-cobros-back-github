import logger from "../logs/logger.js";
import { getIO } from "./socket.js";
import { sendEmail } from "../services/nodemailer.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const generarNumeroContrato = async () => {
  const añoActual = new Date().getFullYear();

  const ultimaCuenta = await prisma.contrato.findFirst({
    where: {
      numero: {
        startsWith: `CT-${añoActual}`,
      },
    },
    orderBy: {
      numero: "desc",
    },
  });

  let nuevoConsecutivo = 1;

  if (ultimaCuenta) {
    logger.info("[PRISMA] ULTIMO CONTRATO CREADO ENCONTRADO!!!!!");
    const partes = ultimaCuenta.numero.split("-");
    const ultimoNumero = parseInt(partes[2]);
    nuevoConsecutivo = ultimoNumero + 1;
  }

  logger.info(
    "[SERVER] NUMERO DE CONTRATO UNICO GENERADO AUTOMATICAMENTE!!!!!"
  );
  const numeroFormateado = String(nuevoConsecutivo).padStart(4, "0");
  return `CT-${añoActual}-${numeroFormateado}`;
};

export const generarNumeroCuenta = async () => {
  const añoActual = new Date().getFullYear();

  const ultimaCuenta = await prisma.cuentaCobro.findFirst({
    where: {
      numeroCuenta: {
        startsWith: `CC-${añoActual}`,
      },
    },
    orderBy: {
      numeroCuenta: "desc",
    },
  });

  let nuevoConsecutivo = 1;

  if (ultimaCuenta) {
    logger.info("[PRISMA] ULTIMA CUENTA DE COBRO CREADA ENCONTRADA!!!!!");
    const partes = ultimaCuenta.numeroCuenta.split("-");
    const ultimoNumero = parseInt(partes[2]);
    nuevoConsecutivo = ultimoNumero + 1;
  }

  logger.info(
    "[SERVER] NUMERO DE CUENTA DE COBRO UNICO GENERADO AUTOMATICAMENTE!!!!!"
  );
  const numeroFormateado = String(nuevoConsecutivo).padStart(4, "0");
  return `CC-${añoActual}-${numeroFormateado}`;
};

export const calcularPorcentajeEjecucion = (periodoInicio, periodoFin) => {
  const inicio = new Date(periodoInicio);
  const fin = new Date(periodoFin);
  const hoy = new Date();

  if (hoy <= inicio) {
    logger.info("[SERVER] PROCENTAJE DE EJECUCION DEL CONTRATO ES: 0%");
    return 0;
  }

  if (hoy >= fin) {
    logger.info("[SERVER] PROCENTAJE DE EJECUCION DEL CONTRATO ES: 0%");
    return 100;
  }

  const totalTiempo = fin.getTime() - inicio.getTime();
  const tiempoTranscurrido = hoy.getTime() - inicio.getTime();

  const porcentaje = (tiempoTranscurrido / totalTiempo) * 100;
  logger.info(`[SERVER] PORCENTAJE DE EJECUCCION ES: ${porcentaje}%`);
  return Math.round(porcentaje);
};

export const enviarNotificaciones = async (titulo, contenido, user) => {
  try{
    const io = await getIO();
    const notificacion = await prisma.notificacion.create({
      data: {
        usuarioId: user.id,
        contenido: contenido,
        asunto: titulo,
      },
    });

    if(!notificacion){
      logger.warn("[PRISMA] CREACION DE NOTIFICACION FALLIDA!!!!");
      return new Error("CREACION DE NOTIFICACION FALLIDA");
    }else{
      io.emit("notificacion", {
        titulo,
        contenido,
        fecha: new Date(),
      });
      await sendEmail(user.email, titulo, contenido, user.name);
      logger.warn("[PRISMA] CREACION DE NOTIFICACION EXITOSA!!!!");
    }
  }catch(err){
    logger.error("[SERVER] ERROR AL GENERAR NOTIFICACIONES!!!!");
    return new Error("ERROR AL GENERAR NOTIFICACIONES");
  }
};

export const generarPasswordSegura = () => {
  const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const minusculas = "abcdefghijklmnopqrstuvwxyz";
  const numeros = "0123456789";
  const simbolos = "!@#$%^&*()_+[]{}|;:,.<>?";

  const todas = mayusculas + minusculas + numeros + simbolos;

  // Longitud aleatoria entre 8 y 12
  const longitud =  Math.floor(Math.random() * 5) + 8;

  // Asegurar al menos uno de cada tipo requerido
  logger.info('[SERVER] GENERANDO CONTRASEÑA CON LOS CRITERIOS!!!!');
    let password = [
    mayusculas[Math.floor(Math.random() * mayusculas.length)],
    numeros[Math.floor(Math.random() * numeros.length)],
    simbolos[Math.floor(Math.random() * simbolos.length)],
  ];

  // Rellenar el resto con caracteres aleatorios
  logger.info('[SERVER] AGREGANDO CARACTERES RAMDOM PARA MAYOR SEGURIDAA!!!!');
  for (let i = password.length; i < longitud; i++) {
    password.push(todas[Math.floor(Math.random() * todas.length)]);
  }

  // Mezclar la contraseña para evitar patrón predecible
  logger.info('[SERVER] CONTRASEÑA GENERADA EXITOSAMENTE!!!!!');
  const pass = password.sort(() => Math.random() - 0.5).join("");
  return pass;
}
