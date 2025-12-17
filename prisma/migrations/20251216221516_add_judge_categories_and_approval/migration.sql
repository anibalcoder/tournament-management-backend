/*
  Warnings:

  - You are about to drop the column `created_at` on the `judges` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `judges` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `judges` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `judges` DROP COLUMN `created_at`,
    DROP COLUMN `is_active`,
    DROP COLUMN `specialization`,
    ADD COLUMN `approved_at` TIMESTAMP(0) NULL,
    ADD COLUMN `approved_by` INTEGER NULL,
    ADD COLUMN `is_approved` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `judge_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judge_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    INDEX `judge_categories_judge_id_idx`(`judge_id`),
    INDEX `judge_categories_category_id_idx`(`category_id`),
    UNIQUE INDEX `judge_categories_judge_id_category_id_key`(`judge_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `judges_approved_by_idx` ON `judges`(`approved_by`);

-- AddForeignKey
ALTER TABLE `judges` ADD CONSTRAINT `judges_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `judge_categories` ADD CONSTRAINT `judge_categories_judge_id_fkey` FOREIGN KEY (`judge_id`) REFERENCES `judges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `judge_categories` ADD CONSTRAINT `judge_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
