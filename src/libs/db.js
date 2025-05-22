const mongoose = require('mongoose');
const config = require('../config/config.js');
const logger = require('../logs/logger.js');


const urlDB = `mongodb://${config.userDB}:${config.passDB}@${config.hostDB}:${config.portDB}`;
const conectionDB = async () => {

    await mongoose.connect(urlDB)
    .then((db) => {
        logger.info('CONEXION A LA DB EXITOSA!!!', db);
    })
    .catch((err) => {
        logger.error('ERROR DE CONEXION A LA DB: ', err);
        return false;
    });
};

module.exports = {
    conectionDB
};