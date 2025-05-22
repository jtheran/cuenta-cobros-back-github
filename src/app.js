import express from 'express';
import http from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';
import passportJWT from './middlewares/passport.js';
const authRoutes = require('./routes/auth.routes.js');
import fileRoutes from './routes/file.routes.js';
import notifyRoutes from './routes/notification.routes.js';
import emailRoutes from './routes/email.routes.js';

//* INICIALIZATION
const app = express();
const server = http.createServer(app);

//* MIDDLEWARES
app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(morgan('morgan'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(passport.initialize());
passport.use(passportJWT);

//* ROUTES
app.use(authRoutes);
app.use('/api', maintenaceRoutes);




module.exports = server;

