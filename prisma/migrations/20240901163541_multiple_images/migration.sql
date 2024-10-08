/*
  Warnings:

  - The `answerImage` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `chatImage` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `questionImage` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answerImage",
ADD COLUMN     "answerImage" TEXT[],
DROP COLUMN "chatImage",
ADD COLUMN     "chatImage" TEXT[],
DROP COLUMN "questionImage",
ADD COLUMN     "questionImage" TEXT[];
