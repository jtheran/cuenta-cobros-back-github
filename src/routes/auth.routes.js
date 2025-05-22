const { Router } = require('express');
const passport = require('passport');
const { login, logout, register } = require('../controllers/auth.controller.js');
const router = Router();

router.post('/login', login);

router.get('/logout', logout);

router.post('/register', passport.authenticate('jwt', { session: false}), register);

module.exports = router;