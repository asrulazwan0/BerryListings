/*
  Warnings:

  - Added the required column `addressLine` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bathrooms` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bedrooms` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sqft` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Property` table without a default value. This is not possible if the table is not empty.

*/

-- These rows are leftover fixtures from the pre-agent/address schema (e.g. price -5,
-- title "Updated Villa") and predate the new required columns below -- clearing them
-- rather than backfilling fabricated addresses/agents onto real-looking rows.
DELETE FROM `Property`;

-- AlterTable
ALTER TABLE `Property` ADD COLUMN `addressLine` VARCHAR(191) NOT NULL,
    ADD COLUMN `agentId` INTEGER NOT NULL,
    ADD COLUMN `amenities` JSON NULL,
    ADD COLUMN `bathrooms` DOUBLE NOT NULL,
    ADD COLUMN `bedrooms` INTEGER NOT NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `lotSizeAcres` DOUBLE NULL,
    ADD COLUMN `sqft` INTEGER NOT NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'ACTIVE', 'PENDING', 'SOLD') NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `type` ENUM('HOUSE', 'CONDO', 'TOWNHOME', 'LAND') NOT NULL DEFAULT 'HOUSE',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `yearBuilt` INTEGER NULL;

-- CreateTable
CREATE TABLE `PropertyPhoto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propertyId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyPhoto` ADD CONSTRAINT `PropertyPhoto_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
