const bcrypt = require('bcryptjs');

const encryptPass = async (pass) => {
    const salt = await bcrypt.genSalt();
    const passHash = await bcrypt.hash(pass, salt);
    return passHash;
};

const matchPass = async (pass, password) => {
    const match = await bcrypt.compare(pass, password);
    return match;
};

module.exports = {
    encryptPass,
    matchPass
};