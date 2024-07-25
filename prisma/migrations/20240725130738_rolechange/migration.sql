/*
  Warnings:

  - A unique constraint covering the columns `[date,userId,role]` on the table `UserDailyStats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserDailyStats_date_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyStats_date_userId_role_key" ON "UserDailyStats"("date", "userId", "role");
