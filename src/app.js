const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const passportJWT = require('./middlewares/passport.js');
const authRoutes = require('./routes/auth.routes.js');

//* INICIALIZATION
const app = express();

//* MIDDLEWARES
app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
passport.use(passportJWT);

//* ROUTES
app.use(authRoutes);



module.exports = app;

