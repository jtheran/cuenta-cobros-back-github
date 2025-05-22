const winston = require('winston');
const { combine, timestamp, printf, colorize} = winston.format;
require('colors');


// Define el formato de los logs
const logFormat = printf(({ level, message, timestamp }) => {

  let formattedMessage = `[${timestamp.toUpperCase()}]:[${level.toUpperCase()}] :: [${message.toUpperCase()}]`;

  // Agregar colores específicos al nivel del log solo en la consola
  // if (level === 'info') {
  //   formattedMessage = formattedMessage.green;
  // } else if (level === 'warn') {
  //   formattedMessage = formattedMessage.yellow;
  // } else if (level === 'error') {
  //   formattedMessage = formattedMessage.red;
  // }

  return formattedMessage;
});

// Configura los transportes (en este caso, un archivo)
const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
    logFormat,
  ),
  transports: [
    new winston.transports.File({
      filename: `${__dirname}/logger.log`,  // Ruta del archivo de logs
    }),
  ],
});



// También puedes agregar un transporte para la consola si lo deseas
logger.add(new winston.transports.Console());

module.exports = logger;