-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `documentoIdentidad` VARCHAR(191) NOT NULL,
    `tipoDocumento` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `ultimoAcceso` DATETIME(3) NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaActualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `objeto` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `documentosRequeridos` JSON NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'ASIGNADO',
    `tipoContrato` VARCHAR(191) NOT NULL,
    `metadatos` JSON NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaActualizacion` DATETIME(3) NOT NULL,
    `contratistaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Contrato_numero_key`(`numero`),
    INDEX `Contrato_contratistaId_idx`(`contratistaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CuentaCobro` (
    `id` VARCHAR(191) NOT NULL,
    `numeroCuenta` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `documentosRequeridos` JSON NULL,
    `periodoInicio` DATETIME(3) NOT NULL,
    `periodoFin` DATETIME(3) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'CREADA',
    `descripcionActividades` VARCHAR(191) NOT NULL,
    `datosBancarios` JSON NOT NULL,
    `fechaRadicacion` DATETIME(3) NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaActualizacion` DATETIME(3) NOT NULL,
    `contratoId` VARCHAR(191) NOT NULL,
    `contratistaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CuentaCobro_numeroCuenta_key`(`numeroCuenta`),
    INDEX `CuentaCobro_contratoId_idx`(`contratoId`),
    INDEX `CuentaCobro_contratistaId_idx`(`contratistaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Revision` (
    `id` VARCHAR(191) NOT NULL,
    `observaciones` VARCHAR(191) NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(191) NOT NULL,
    `cuentaCobroId` VARCHAR(191) NOT NULL,
    `revisorId` VARCHAR(191) NOT NULL,

    INDEX `Revision_cuentaCobroId_idx`(`cuentaCobroId`),
    INDEX `Revision_revisorId_idx`(`revisorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comentario` (
    `id` VARCHAR(191) NOT NULL,
    `contenido` VARCHAR(191) NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revisionId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `Comentario_revisionId_idx`(`revisionId`),
    INDEX `Comentario_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `fechaPago` DATETIME(3) NULL,
    `estado` VARCHAR(191) NOT NULL,
    `metodoPago` VARCHAR(191) NOT NULL,
    `referenciaPago` VARCHAR(191) NULL,
    `comprobante` VARCHAR(191) NULL,
    `observaciones` VARCHAR(191) NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cuentaCobroId` VARCHAR(191) NOT NULL,
    `financieroId` VARCHAR(191) NOT NULL,

    INDEX `Pago_cuentaCobroId_idx`(`cuentaCobroId`),
    INDEX `Pago_financieroId_idx`(`financieroId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Documento` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `fechaSubida` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `contratoId` VARCHAR(191) NULL,
    `cuentaCobroId` VARCHAR(191) NULL,

    INDEX `Documento_contratoId_idx`(`contratoId`),
    INDEX `Documento_cuentaCobroId_idx`(`cuentaCobroId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventoAuditoria` (
    `id` VARCHAR(191) NOT NULL,
    `accion` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadatos` JSON NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `EventoAuditoria_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacion` (
    `id` VARCHAR(191) NOT NULL,
    `asunto` VARCHAR(191) NOT NULL,
    `contenido` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaActualizacion` DATETIME(3) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    INDEX `Notificacion_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_contratistaId_fkey` FOREIGN KEY (`contratistaId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuentaCobro` ADD CONSTRAINT `CuentaCobro_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CuentaCobro` ADD CONSTRAINT `CuentaCobro_contratistaId_fkey` FOREIGN KEY (`contratistaId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Revision` ADD CONSTRAINT `Revision_cuentaCobroId_fkey` FOREIGN KEY (`cuentaCobroId`) REFERENCES `CuentaCobro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Revision` ADD CONSTRAINT `Revision_revisorId_fkey` FOREIGN KEY (`revisorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentario` ADD CONSTRAINT `Comentario_revisionId_fkey` FOREIGN KEY (`revisionId`) REFERENCES `Revision`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentario` ADD CONSTRAINT `Comentario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_cuentaCobroId_fkey` FOREIGN KEY (`cuentaCobroId`) REFERENCES `CuentaCobro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_financieroId_fkey` FOREIGN KEY (`financieroId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `Contrato`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_cuentaCobroId_fkey` FOREIGN KEY (`cuentaCobroId`) REFERENCES `CuentaCobro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoAuditoria` ADD CONSTRAINT `EventoAuditoria_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
