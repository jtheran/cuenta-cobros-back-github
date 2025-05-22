import logger from '../logs/logger.js';
import { sendEmail, sendMassiveEmail } from '../services/nodemailer.js';

export const sendEmailBack = async (req, res) => {
    try{
        const name = req.user.name; 
        const { email, subject, text} = req.body;
        await sendEmail(email, subject, text, name);

        logger.info('[EMAIL] ENVIO DE CORREO EXITOSO A '+email);
        return res.status(200).json({msg: 'ENVIO DE CORREO EXITOSO'});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}

export const sendEmailMassiveBack = async (req, res) => {
    try{
        const { subject, text } = req.body;
        await sendMassiveEmail(subject, text);

        logger.info('[EMAIL] ENVIO DE CORREOS MASIVOS EXITOSO');
        return res.status(200).json({msg: 'ENVIO DE CORREOS MASIVOS EXITOSO'});
    }catch(err){
        logger.error('[SERVER] INTERNAL SERVER ERROR: '+err.message);
        return res.status(500).json({msg:  'INTERNAL SERVER ERROR'});
    }
}