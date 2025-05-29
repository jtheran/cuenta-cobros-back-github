-- AlterTable
ALTER TABLE `Contrato` ADD COLUMN `obligaciones` JSON NULL,
    ADD COLUMN `valorMensual` DOUBLE NOT NULL DEFAULT 0.0;
