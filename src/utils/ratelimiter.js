import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // Máximo de intentos de login por IP
    message: 'Demasiados intentos, Inténtalo en 15 min.',
    headers: true
});

export default loginLimiter;
