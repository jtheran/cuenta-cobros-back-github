import express from 'express';
import http from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'; // Importar cookie-parser
import cors from 'cors';
import passport from 'passport';
import passportJWT from './middlewares/passport.js';
import authRoutes from './routes/auth.routes.js';
import fileRoutes from './routes/file.routes.js';
import notifyRoutes from './routes/notification.routes.js';
import emailRoutes from './routes/email.routes.js';
import maintenaceRoutes from './routes/maintenance.route.js';
import userRoutes from './routes/user.routes.js';
import contractRoutes from './routes/contrato.routes.js';

//* INICIALIZATION
const app = express();
const server = http.createServer(app);

//* MIDDLEWARES
app.use(morgan('dev'));
// Configuración de CORS - ¡MUY IMPORTANTE para el manejo de credenciales!
app.use(cors({
    origin: 'http://localhost:3000', // El origen de tu frontend Next.js
    credentials: true, // Habilitar el envío de cookies y encabezados de autorización
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Usar el middleware de cookie-parser
app.use(express.json());
app.use(morgan('morgan'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(passport.initialize());
passport.use(passportJWT);

//* ROUTES
app.use('/api', authRoutes);
app.use('/api', maintenaceRoutes);
app.use('/api', fileRoutes);
app.use('/api', emailRoutes);
app.use('/api', notifyRoutes);
app.use('/api', userRoutes);
app.use('/api', contractRoutes);




export default server;

