-- DropForeignKey
ALTER TABLE `Contrato` DROP FOREIGN KEY `Contrato_contratistaId_fkey`;

-- AlterTable
ALTER TABLE `Contrato` MODIFY `contratistaId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_contratistaId_fkey` FOREIGN KEY (`contratistaId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
