import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: 3325,
    key: process.env.KEY_SECRET || 'qwerty',
    refreshKey: process.env.REFRESH_KEY || 'qazwer',
    hostMail: process.env.MAIL_HOST || 'server1.lsv-tech.com',
    portMail: process.env.MAIL_PORT || 456,
    salt: process.env.SALT || 10,
    adminEmail: process.env.EMAIL_ADMIN || 'qa@lsv-tech.com',
    passAdminEmail: process.env.PASS_EMAIL_ADMIN || "o].tGf)%=$GK",
    passAdmin: process.env.PASS_ADMIN || 'Testing24@',
}


export default config;