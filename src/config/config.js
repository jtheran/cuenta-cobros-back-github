import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 2048,
    key: process.env.KEY_SECRET,
    hostMail: process.env.MAIL_HOST || '',
    portMail: process.env.MAIL_PORT || '456',
    salt: process.env.SALT || 10,
    adminEmail: process.env.EMAIL_ADMIN || 'admin@admin.com',
    passAdminEmail: process.env.PASS_EMAIL_ADMIN || 'Testing25!',
    passAdmin: process.env.PASS_ADMIN || 'Testing25!',
}


export default config;