import express from 'express';
import http from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'; // Importar cookie-parser
import cors from 'cors';
//import passport from 'passport';
//import passportJWT from './middlewares/passport.js';
import authRoutes from './routes/auth.routes.js';
import fileRoutes from './routes/file.routes.js';
import notifyRoutes from './routes/notification.routes.js';
import emailRoutes from './routes/email.routes.js';
import maintenaceRoutes from './routes/maintenance.route.js';
import userRoutes from './routes/user.routes.js';
import contractRoutes from './routes/contrato.routes.js';
import cuentaRoputes from './routes/cuenta.routes.js'
import revisionRoutes from './routes/revision.routes.js';
import pagoRoutes from './routes/pago.routes.js';
import statsRoutes from './routes/stats.routes.js';

//* INICIALIZATION
const app = express();
const server = http.createServer(app);

//* MIDDLEWARES
app.use(morgan('dev'));
// Configuración de CORS - ¡MUY IMPORTANTE para el manejo de credenciales!
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Usar el middleware de cookie-parser
app.use(express.json());
app.use(morgan('morgan'));
app.use(helmet({ contentSecurityPolicy: false }));
//app.use(passport.initialize());
//passport.use(passportJWT);

// Sirve los archivos estáticos subidos por Multer
app.use('/uploads', express.static('docs')); // <-- ¡AGREGA ESTA LÍNEA!
// Esto significa que un archivo en 'docs/imagen.jpg'
// será accesible en 'http://tu-backend/uploads/imagen.jpg'


//* ROUTES
app.use('/api', authRoutes);
app.use('/api', maintenaceRoutes);
app.use('/api', fileRoutes);
app.use('/api', emailRoutes);
app.use('/api', notifyRoutes);
app.use('/api', userRoutes);
app.use('/api', contractRoutes);
app.use('/api', cuentaRoputes);
app.use('/api', revisionRoutes);
app.use('/api', pagoRoutes);
app.use('/api', statsRoutes);


export default server;

