/*
  Warnings:

  - You are about to drop the column `full_name` on the `club_owners` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by_admin_id` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `competitors` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `competitors` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `competitors` table. All the data in the column will be lost.
  - You are about to drop the column `is_published` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `is_approved` on table `clubs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `club_owners` DROP FOREIGN KEY `club_owners_ibfk_1`;

-- DropForeignKey
ALTER TABLE `clubs` DROP FOREIGN KEY `clubs_ibfk_1`;

-- DropForeignKey
ALTER TABLE `clubs` DROP FOREIGN KEY `clubs_ibfk_2`;

-- DropForeignKey
ALTER TABLE `competitors` DROP FOREIGN KEY `competitors_ibfk_1`;

-- DropForeignKey
ALTER TABLE `competitors` DROP FOREIGN KEY `competitors_ibfk_2`;

-- DropForeignKey
ALTER TABLE `competitors` DROP FOREIGN KEY `competitors_ibfk_3`;

-- DropForeignKey
ALTER TABLE `judge_scores` DROP FOREIGN KEY `judge_scores_ibfk_1`;

-- DropForeignKey
ALTER TABLE `judge_scores` DROP FOREIGN KEY `judge_scores_ibfk_2`;

-- DropForeignKey
ALTER TABLE `judge_scores` DROP FOREIGN KEY `judge_scores_ibfk_3`;

-- DropForeignKey
ALTER TABLE `judges` DROP FOREIGN KEY `judges_ibfk_1`;

-- DropForeignKey
ALTER TABLE `news` DROP FOREIGN KEY `news_ibfk_1`;

-- DropForeignKey
ALTER TABLE `password_resets` DROP FOREIGN KEY `password_resets_ibfk_1`;

-- DropForeignKey
ALTER TABLE `rankings` DROP FOREIGN KEY `rankings_ibfk_1`;

-- DropForeignKey
ALTER TABLE `rankings` DROP FOREIGN KEY `rankings_ibfk_2`;

-- DropForeignKey
ALTER TABLE `rankings` DROP FOREIGN KEY `rankings_ibfk_3`;

-- DropForeignKey
ALTER TABLE `robots` DROP FOREIGN KEY `robots_ibfk_1`;

-- DropForeignKey
ALTER TABLE `robots` DROP FOREIGN KEY `robots_ibfk_2`;

-- DropForeignKey
ALTER TABLE `tournament_judges` DROP FOREIGN KEY `tournament_judges_ibfk_1`;

-- DropForeignKey
ALTER TABLE `tournament_judges` DROP FOREIGN KEY `tournament_judges_ibfk_2`;

-- DropForeignKey
ALTER TABLE `tournament_registrations` DROP FOREIGN KEY `tournament_registrations_ibfk_1`;

-- DropForeignKey
ALTER TABLE `tournament_registrations` DROP FOREIGN KEY `tournament_registrations_ibfk_2`;

-- DropForeignKey
ALTER TABLE `tournament_registrations` DROP FOREIGN KEY `tournament_registrations_ibfk_3`;

-- DropForeignKey
ALTER TABLE `tournament_registrations` DROP FOREIGN KEY `tournament_registrations_ibfk_4`;

-- DropForeignKey
ALTER TABLE `tournament_registrations` DROP FOREIGN KEY `tournament_registrations_ibfk_5`;

-- DropForeignKey
ALTER TABLE `tournament_results` DROP FOREIGN KEY `tournament_results_ibfk_1`;

-- DropForeignKey
ALTER TABLE `tournament_results` DROP FOREIGN KEY `tournament_results_ibfk_2`;

-- DropForeignKey
ALTER TABLE `tournament_results` DROP FOREIGN KEY `tournament_results_ibfk_3`;

-- DropForeignKey
ALTER TABLE `tournament_results` DROP FOREIGN KEY `tournament_results_ibfk_4`;

-- DropForeignKey
ALTER TABLE `tournaments` DROP FOREIGN KEY `tournaments_ibfk_1`;

-- DropIndex
DROP INDEX `approved_by_admin_id` ON `clubs`;

-- DropIndex
DROP INDEX `nickname` ON `competitors`;

-- AlterTable
ALTER TABLE `club_owners` DROP COLUMN `full_name`,
    ADD COLUMN `approved_at` TIMESTAMP(0) NULL,
    ADD COLUMN `approved_by_admin_id` INTEGER NULL,
    ADD COLUMN `is_approved` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `clubs` DROP COLUMN `approved_at`,
    DROP COLUMN `approved_by_admin_id`,
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approved_by` INTEGER NULL,
    MODIFY `is_approved` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `competitors` DROP COLUMN `full_name`,
    DROP COLUMN `nickname`,
    DROP COLUMN `profile_picture`;

-- AlterTable
ALTER TABLE `news` DROP COLUMN `is_published`,
    ADD COLUMN `image_url` TEXT NULL,
    ADD COLUMN `source` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `full_name`,
    ADD COLUMN `age` TINYINT UNSIGNED NULL,
    ADD COLUMN `email` VARCHAR(320) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(255) NOT NULL,
    ADD COLUMN `name` VARCHAR(255) NOT NULL,
    ADD COLUMN `profile_picture` TEXT NULL;

-- CreateIndex
CREATE INDEX `club_owners_approved_by_admin_id_idx` ON `club_owners`(`approved_by_admin_id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);

-- AddForeignKey
ALTER TABLE `club_owners` ADD CONSTRAINT `club_owners_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `club_owners` ADD CONSTRAINT `club_owners_approved_by_admin_id_fkey` FOREIGN KEY (`approved_by_admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clubs` ADD CONSTRAINT `clubs_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clubs` ADD CONSTRAINT `clubs_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `competitors` ADD CONSTRAINT `competitors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `competitors` ADD CONSTRAINT `competitors_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `competitors` ADD CONSTRAINT `competitors_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `judge_scores` ADD CONSTRAINT `judge_scores_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `judge_scores` ADD CONSTRAINT `judge_scores_judge_id_fkey` FOREIGN KEY (`judge_id`) REFERENCES `judges`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `judge_scores` ADD CONSTRAINT `judge_scores_competitor_id_fkey` FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `judges` ADD CONSTRAINT `judges_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_published_by_fkey` FOREIGN KEY (`published_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rankings` ADD CONSTRAINT `rankings_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rankings` ADD CONSTRAINT `rankings_competitor_id_fkey` FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rankings` ADD CONSTRAINT `rankings_robot_id_fkey` FOREIGN KEY (`robot_id`) REFERENCES `robots`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `robots` ADD CONSTRAINT `robots_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `robots` ADD CONSTRAINT `robots_competitor_id_fkey` FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_judges` ADD CONSTRAINT `tournament_judges_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_judges` ADD CONSTRAINT `tournament_judges_judge_id_fkey` FOREIGN KEY (`judge_id`) REFERENCES `judges`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_competitor_id_fkey` FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_robot_id_fkey` FOREIGN KEY (`robot_id`) REFERENCES `robots`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_registrations` ADD CONSTRAINT `tournament_registrations_assigned_judge_id_fkey` FOREIGN KEY (`assigned_judge_id`) REFERENCES `judges`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_results` ADD CONSTRAINT `tournament_results_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_results` ADD CONSTRAINT `tournament_results_competitor_id_fkey` FOREIGN KEY (`competitor_id`) REFERENCES `competitors`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_results` ADD CONSTRAINT `tournament_results_robot_id_fkey` FOREIGN KEY (`robot_id`) REFERENCES `robots`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournament_results` ADD CONSTRAINT `tournament_results_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tournaments` ADD CONSTRAINT `tournaments_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `categories` RENAME INDEX `name` TO `categories_name_key`;

-- RenameIndex
ALTER TABLE `club_owners` RENAME INDEX `dni` TO `club_owners_dni_key`;

-- RenameIndex
ALTER TABLE `clubs` RENAME INDEX `owner_id` TO `clubs_owner_id_idx`;

-- RenameIndex
ALTER TABLE `competitors` RENAME INDEX `approved_by` TO `competitors_approved_by_idx`;

-- RenameIndex
ALTER TABLE `competitors` RENAME INDEX `club_id` TO `competitors_club_id_idx`;

-- RenameIndex
ALTER TABLE `judge_scores` RENAME INDEX `competitor_id` TO `judge_scores_competitor_id_idx`;

-- RenameIndex
ALTER TABLE `judge_scores` RENAME INDEX `judge_id` TO `judge_scores_judge_id_idx`;

-- RenameIndex
ALTER TABLE `judge_scores` RENAME INDEX `tournament_id` TO `judge_scores_tournament_id_idx`;

-- RenameIndex
ALTER TABLE `judges` RENAME INDEX `user_id` TO `judges_user_id_idx`;

-- RenameIndex
ALTER TABLE `news` RENAME INDEX `published_by` TO `news_published_by_idx`;

-- RenameIndex
ALTER TABLE `password_resets` RENAME INDEX `user_id` TO `password_resets_user_id_idx`;

-- RenameIndex
ALTER TABLE `rankings` RENAME INDEX `competitor_id` TO `rankings_competitor_id_idx`;

-- RenameIndex
ALTER TABLE `rankings` RENAME INDEX `robot_id` TO `rankings_robot_id_idx`;

-- RenameIndex
ALTER TABLE `rankings` RENAME INDEX `tournament_id` TO `rankings_tournament_id_idx`;

-- RenameIndex
ALTER TABLE `robots` RENAME INDEX `category_id` TO `robots_category_id_idx`;

-- RenameIndex
ALTER TABLE `robots` RENAME INDEX `competitor_id` TO `robots_competitor_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_judges` RENAME INDEX `judge_id` TO `tournament_judges_judge_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_judges` RENAME INDEX `tournament_id` TO `tournament_judges_tournament_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_registrations` RENAME INDEX `assigned_judge_id` TO `tournament_registrations_assigned_judge_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_registrations` RENAME INDEX `category_id` TO `tournament_registrations_category_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_registrations` RENAME INDEX `competitor_id` TO `tournament_registrations_competitor_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_registrations` RENAME INDEX `robot_id` TO `tournament_registrations_robot_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_registrations` RENAME INDEX `tournament_id` TO `tournament_registrations_tournament_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_results` RENAME INDEX `category_id` TO `tournament_results_category_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_results` RENAME INDEX `competitor_id` TO `tournament_results_competitor_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_results` RENAME INDEX `robot_id` TO `tournament_results_robot_id_idx`;

-- RenameIndex
ALTER TABLE `tournament_results` RENAME INDEX `tournament_id` TO `tournament_results_tournament_id_idx`;

-- RenameIndex
ALTER TABLE `tournaments` RENAME INDEX `created_by` TO `tournaments_created_by_idx`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `nickname` TO `users_nickname_key`;
