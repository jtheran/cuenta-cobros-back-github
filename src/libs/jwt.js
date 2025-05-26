import jwt from 'jsonwebtoken';
import config from '../config/config.js'; // Asumo que config.key y config.refreshKey están aquí

const createToken = (payload) => {
    // Access Token de corta duración
    const accessToken = jwt.sign(payload, config.key, {
        expiresIn: '30m', // Ejemplo: 30 minutos
    });

    // Refresh Token de larga duración
    const refreshToken = jwt.sign(payload, config.refreshKey, {
        expiresIn: '2d', // Ejemplo: 7 días
    });

    return {
        accessToken, // Lo llamo 'accessToken' aquí para consistencia
        refreshToken,
    };
};

export default createToken;