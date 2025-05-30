-- AlterTable
ALTER TABLE `Documento` ADD COLUMN `usuarioId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
