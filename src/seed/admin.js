import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcrypt';
import config from '../config/config.js';
import logger from '../logs/logger.js';

const prisma = new PrismaClient();

async function createAdminUser() {
    const adminEmail = config.adminEmail;
    const salt = await bcrypt.genSalt();

    const existingAdmin = await prisma.usuario.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(config.passAdmin, salt);

        await prisma.usuario.create({
            data: {
                nombre: "Admin",
                apellido: "LSV",
                email: adminEmail,
                passwor: hashedPassword,
                role: "admin",
                tipoDocumento: "CEDULA",
                documentoIdentidad: "1047000111",

            },
        });
        logger.info("[SERVER] Admin user created successfully!");
    } else {
        console.log("[SERVER] Admin user already exists.");
    }
}

export default createAdminUser;