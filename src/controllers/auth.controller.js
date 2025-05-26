import jwt from 'jsonwebtoken';
import config from '../config/config.js'; // Asumo que config.key y config.refreshKey están aquí
import logger from '../logs/logger.js';
import { matchPass } from '../libs/bcrypt.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Función para crear tokens (no cambia, solo genera los strings)
const createToken = (payload) => {
    const accessToken = jwt.sign(payload, config.key, {
        expiresIn: '30m', // Ejemplo: 30 minutos
    });

    const refreshToken = jwt.sign(payload, config.refreshKey, {
        expiresIn: '2d', // Ejemplo: 7 días
    });

    return {
        accessToken,
        refreshToken,
    };
};

// Configuración de la cookie (puedes moverla a un archivo de configuración si es necesario)
// NOTA: En producción, 'secure' debe ser 'true' para HTTPS.
const cookieOptions = {
    httpOnly: true, // No accesible vía JavaScript del navegador
     // 'true' en producción, 'false' en desarrollo si no usas HTTPS
    // secure: process.env.NODE_ENV === 'production', 
    secure: false, 
    sameSite: 'Lax', // Protección CSRF: 'Strict' para mayor seguridad, 'Lax' para un balance
    path: '/', // La cookie estará disponible para todas las rutas
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.usuario.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            logger.warn('[PRISMA] USUARIO NO ESTA REGISTRADO!!!');
            return res.status(404).json({ msg: 'USUARIO NO ESTA REGISTRADO' });
        }

        const isValidated = await matchPass(password, user.password);

        if (!isValidated) {
            logger.warn('[AUTH] CORREO O PASSWORD ERRONEA!!!!');
            return res.status(400).json({ msg: 'CORREO O PASSWORD ERRONEA' });
        }

        const data = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name, 
        };

        // Genera ambos tokens
        const { accessToken, refreshToken } = createToken(data);

        await prisma.usuario.update({
            where: {
                id: user.id
            },
            data: {
                ultimoAcceso: new Date(),
            }
        });

        // Establecer la cookie con el Access Token (httpOnly)
        // La duración de la cookie debe coincidir con el `expiresIn` del access token
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: jwt.decode(accessToken).exp * 1000 - Date.now(), // Calcula maxAge dinámicamente
        });

        // Establecer la cookie con el Refresh Token (httpOnly)
        // La duración de la cookie debe coincidir con el `expiresIn` del refresh token
        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: jwt.decode(refreshToken).exp * 1000 - Date.now(), // Calcula maxAge dinámicamente
        });

        logger.info('LOGUEADO CORRECTAMENTE!!!');
        // AHORA: Enviamos los datos del usuario directamente en el cuerpo de la respuesta JSON
        return res.status(200).json({
            msg: 'LOGUEADO CORRECTAMENTE',
            user: { // Datos del usuario para que el frontend los guarde
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
            }
        });
    } catch (err) {
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({ msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message });
    }
};

export const logout = (req, res) => {
    try {
        // Limpiar ambas cookies al hacer logout
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);

        logger.info('HA SIDO DESLOGUEADO!!!');
        return res.status(200).json({ msg: 'HA SIDO DESLOGUEADO!!!' });
    } catch (err) {
        logger.error('ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({ msg: 'ERROR INTERNO DEL SERVIDOR: ' + err.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        // El refresh token ahora viene en la cookie
        const refreshToken = req.cookies.refreshToken; // req.cookies requiere un middleware como `cookie-parser`

        if (!refreshToken) {
            logger.warn('[JWT] REFRESH TOKEN REQUERIDO (COOKIE FALTANTE)!!!!');
            // Si no hay refresh token, es un error de autenticación
            return res.status(401).json({ msg: 'NO AUTORIZADO: REFRESH TOKEN FALTANTE' });
        }

        // Verifica el refresh token
        const payload = jwt.verify(refreshToken, config.refreshKey);

        const data = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            name: payload.name,
        };

        // Genera un nuevo access token
        const newAccessToken = jwt.sign(data, config.key, {
            expiresIn: '30m', // Mismo expiresIn que el access token original
        });

        // Generar un nuevo refresh token y establecer una nueva cookie (Refresh Token Rotation)
        const { refreshToken: newRefreshToken } = createToken(data);

        // Establecer la nueva cookie de Access Token
        res.cookie('accessToken', newAccessToken, {
            ...cookieOptions,
            maxAge: jwt.decode(newAccessToken).exp * 1000 - Date.now(),
        });

        // Establecer la nueva cookie de Refresh Token
        res.cookie('refreshToken', newRefreshToken, {
            ...cookieOptions,
            maxAge: jwt.decode(newRefreshToken).exp * 1000 - Date.now(),
        });

        logger.info('[JWT] GENERACION DEL NUEVO ACCESS TOKEN EXITOSA!!!');
        // Opcional: Puedes devolver los datos del usuario aquí también si el frontend los necesita
        return res.status(200).json({
            msg: 'GENERACION DEL NUEVO ACCESS TOKEN EXITOSA',
            user: { // Datos del usuario para que el frontend los guarde/actualice
                id: payload.id,
                email: payload.email,
                role: payload.role,
                name: payload.name, 
            }
        });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            logger.warn('[JWT] REFRESH TOKEN EXPIRADO');
            // Al expirar el refresh token, el usuario debe iniciar sesión de nuevo
            return res.status(401).json({ msg: 'REFRESH TOKEN EXPIRADO. Por favor, inicie sesión de nuevo.' });
        } else if (err instanceof jwt.JsonWebTokenError) {
            logger.warn('[JWT] REFRESH TOKEN INVÁLIDO: ' + err.message);
            // Si el refresh token es inválido, el usuario debe iniciar sesión de nuevo
            return res.status(401).json({ msg: 'REFRESH TOKEN INVÁLIDO. Por favor, inicie sesión de nuevo.' });
        }
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR: ' + err.message);
        return res.status(500).json({ msg: 'ERROR INTERNO DEL SERVIDOR' });
    }
}

// Middleware de autenticación para proteger rutas
export const authenticateToken = (req, res, next) => {
    const accessToken = req.cookies.accessToken; // Obtener el access token de la cookie

    if (!accessToken) {
        return res.status(401).json({ msg: 'NO AUTORIZADO: ACCESS TOKEN FALTANTE' });
    }

    try {
        const payload = jwt.verify(accessToken, config.key);
        req.user = payload; // Adjuntar el payload del usuario a la solicitud
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            // Si el access token ha expirado, el frontend deberá intentar el refresh.
            // Aquí se devuelve un 401 para que el interceptor de Axios actúe.
            return res.status(401).json({ msg: 'ACCESS TOKEN EXPIRADO' });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ msg: 'ACCESS TOKEN INVÁLIDO' });
        }
        return res.status(500).json({ msg: 'ERROR DE AUTENTICACIÓN' });
    }
};

// NUEVO ENDPOINT: /api/me
export const getMe = (req, res) => {
    try {
        // Si el middleware authenticateToken fue exitoso, req.user ya contiene los datos del usuario
        if (req.user) {
            logger.info('[AUTH] Datos de usuario obtenidos exitosamente para /api/me');
            return res.status(200).json({
                msg: 'Datos de usuario obtenidos exitosamente',
                user: req.user // Devolvemos los datos del usuario adjuntos por el middleware
            });
        } else {
            // Esto no debería ocurrir si authenticateToken funciona correctamente,
            // ya que si no hay usuario, el middleware ya habría enviado un 401/403.
            logger.warn('[AUTH] No se encontraron datos de usuario en la solicitud para /api/me');
            return res.status(401).json({ msg: 'No autenticado o datos de usuario no disponibles.' });
        }
    } catch (err) {
        logger.error('[SERVER] ERROR INTERNO DEL SERVIDOR al obtener datos de usuario: ' + err.message);
        return res.status(500).json({ msg: 'ERROR INTERNO DEL SERVIDOR' });
    }
};
