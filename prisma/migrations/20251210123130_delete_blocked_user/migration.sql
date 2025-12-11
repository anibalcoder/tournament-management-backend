-- DropForeignKey
ALTER TABLE `user_blocks` DROP FOREIGN KEY `user_blocks_blocked_by_fkey`;

-- AddForeignKey
ALTER TABLE `user_blocks` ADD CONSTRAINT `user_blocks_blocked_by_fkey` FOREIGN KEY (`blocked_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
