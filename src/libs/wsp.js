const {  Client, MessageMedia, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const { conectionDB } = require('../database/db.js');
const qrcode = require('qrcode-terminal');
const logger = require('../logs/logger.js');
const mongoose = require('mongoose');
const qrGenerate = require('./qrgenerate.js');

const wsp = async () => {  
await conectionDB();

const storeMongo = new MongoStore({mongoose: mongoose});
const client = new Client({ 
            authStrategy: new RemoteAuth({
                store: storeMongo,
                backupSyncIntervalMs: 300000
            }),
}); 

client.on('qr', async (qr) => {
    logger.info('GENERANDO QR PARA LOGUEO!!!');
    qrcode.generate(qr, {small: true, dark: true});
    logger.info('QR GENERADO EXITOSAMENTE');
    await qrGenerate(qr);
});

client.on('ready', () => {
    logger.info('CONECTADO A WHATSAPP EXITOSAMENTE!!!!!');
});



await client.initialize();

}

module.exports = wsp;