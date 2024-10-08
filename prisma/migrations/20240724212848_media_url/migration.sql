-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "media" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
