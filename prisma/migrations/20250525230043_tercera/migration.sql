/*
  Warnings:

  - You are about to drop the column `porcentajeEjecucion` on the `CuentaCobro` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Contrato` MODIFY `estado` VARCHAR(191) NOT NULL DEFAULT 'ASIGNADO';

-- AlterTable
ALTER TABLE `CuentaCobro` DROP COLUMN `porcentajeEjecucion`,
    MODIFY `estado` VARCHAR(191) NOT NULL DEFAULT 'RADICADA';
