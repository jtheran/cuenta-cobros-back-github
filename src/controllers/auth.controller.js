const logger = require('../logs/logger.js');
const jwt = require('../libs/jwt.js');


const login = async (req, res) => {
    try{
        
        logger.info('LOGUEADO CORRECTAMENTE!!!');
        return res.status(200).json({msg: 'LOGUEADO CORRECTAMENTE'});
    }catch(err){
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message});
    }
};

const logout = (req, res) => {
    try{
        res.header('Autorization', '').status(200).json({msg: 'HA SIDO DESLOGUEADO!!!'});
    }catch(err){
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message});
    }
};

const register = async (req, res) => {
    try{
        
    }catch(err){
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message});
    }
};


module.exports = {
    login,
    logout,
    register
};