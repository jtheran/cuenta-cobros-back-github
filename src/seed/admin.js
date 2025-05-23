import pkg from '@prisma/client';
import { encryptPass } from '../libs/bcrypt.js';
const { PrismaClient } = pkg;
import config from '../config/config.js';
import logger from '../logs/logger.js';

const prisma = new PrismaClient();

async function createAdminUser() {
    const adminEmail = config.adminEmail;

    const existingAdmin = await prisma.usuario.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await encryptPass(config.passAdmin);

        await prisma.usuario.create({
            data: {
                nombre: "Admin",
                apellido: "LSV",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                tipoDocumento: "CEDULA",
                documentoIdentidad: "1047000111",
            },
        });
        logger.info("[SERVER] Admin user created successfully!");
    } else {
        logger.error("[SERVER] Admin user already exists.");
    }
}

export default createAdminUser;