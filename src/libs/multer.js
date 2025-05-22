const multer = require('multer');
const logger = require('../logs/logger.js');
const path = require('path');

const loadFile = async() => {
    //todo: carpeta de carga de archivos
    const outputDirectory = path.join(__dirname, '../upload');
    console.log(outputDirectory);
    // Configuración de multer
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // Carpeta donde se guardarán los archivos
            cb(null, outputDirectory);
        },
        filename: function (req, file, cb) {
            console.log(file);
            logger.info(`NOMBREDE ARCHIVO CARGADO: ${file.originalname}`);
            // Conservar el nombre original del archivo
            logger.info(`RUTA DE ALMACENAMIENTO DE ARCHVIOS: ${outputDirectory}`);
            cb(null, file.originalname);
        }
    });

    const upload = multer({ storage: storage });

    return upload;
};

module.exports = loadFile;