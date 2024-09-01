/*
  Warnings:

  - You are about to drop the column `answerImage` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `chatImage` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `questionImage` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answerImage",
DROP COLUMN "chatImage",
DROP COLUMN "questionImage",
ADD COLUMN     "answerImages" TEXT[],
ADD COLUMN     "chatImages" TEXT[],
ADD COLUMN     "questionImages" TEXT[];
