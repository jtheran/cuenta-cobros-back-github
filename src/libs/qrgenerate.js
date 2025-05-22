const qrImage = require('qr-image');
const fs = require('fs');
const path = require('path');
const logger = require('../logs/logger.js');

// Directorio donde se almacenarán los códigos QR
const outputDirectory = 'C:/Users/Joan Manuel/Documents/PROYECTOS-IDEAS/LSVBOTWSP/public/assets';

// Asegúrate de que el directorio exista
if (!fs.existsSync(outputDirectory)) {
    logger.info('CARPETA DE QR NO EXISTE');
    fs.mkdirSync(outputDirectory);
    logger.info('CARPETA DE QR CREADA!!!');
}

// Función para generar el código QR
async function generateQR(qrData) {// Puedes cambiar esto según tus necesidades
    const fileName = `qr.png`;
    const filePath = path.join(outputDirectory, fileName);

  // Genera el código QR y guarda la imagen
  const code = qrImage.image(qrData, { type: 'png' });
  logger.info(`Código QR (${fileName}) generado con éxito.`);
  code.pipe(fs.createWriteStream(filePath));

    return fileName;
}

module.exports = generateQR;
