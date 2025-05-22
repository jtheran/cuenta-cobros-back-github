const { Strategy, ExtractJwt } = require('passport-jwt');
const config = require('../config/config.js');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.key,
};

const jwtStrategy = new Strategy(options, async (payload, done) => {
    const user = 'poner la consulta de la base de datos, para encontrar al ususario registradoen la base de datos';

    if(user){
        return done(null, user);
    }
    return done(null, null);
});


module.exports = jwtStrategy;
