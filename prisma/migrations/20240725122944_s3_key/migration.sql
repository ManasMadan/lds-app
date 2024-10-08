/*
  Warnings:

  - You are about to drop the column `mediaURL` on the `Question` table. All the data in the column will be lost.
  - Added the required column `imageS3Key` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "mediaURL",
ADD COLUMN     "imageS3Key" TEXT NOT NULL;
