import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcrypt';
import config from '../config/config.js';
import logger from '../logs/logger.js';

const prisma = new PrismaClient();

async function createAdminUser() {
    const adminEmail = config.adminEmail;
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(config.adminPass, 10);
        await prisma.user.create({
            data: {
                name: "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "ADMIN",
                phone: config.adminPhone,
            },
        });
        logger.info("[SERVER] Admin user created successfully!");
    } else {
        console.log("[SERVER] Admin user already exists.");
    }
}

export default createAdminUser;