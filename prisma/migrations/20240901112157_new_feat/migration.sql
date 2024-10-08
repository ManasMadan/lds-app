/*
  Warnings:

  - You are about to drop the column `imageS3Key` on the `Question` table. All the data in the column will be lost.
  - Added the required column `answerImage` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatImage` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfSolving` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionImage` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "imageS3Key",
ADD COLUMN     "answerImage" TEXT NOT NULL,
ADD COLUMN     "chatImage" TEXT NOT NULL,
ADD COLUMN     "dateOfSolving" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "questionImage" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "UserDailyStats" ADD COLUMN     "manualQuestionsSolved" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
