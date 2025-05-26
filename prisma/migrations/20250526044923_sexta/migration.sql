/*
  Warnings:

  - Added the required column `asunto` to the `Notificacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Notificacion` ADD COLUMN `asunto` VARCHAR(191) NOT NULL;
