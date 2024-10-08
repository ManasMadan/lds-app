/*
  Warnings:

  - You are about to drop the column `content` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `media` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "content",
DROP COLUMN "media",
ADD COLUMN     "mediaURL" TEXT;
