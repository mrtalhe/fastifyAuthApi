-- AlterTable
ALTER TABLE "User" ALTER COLUMN "resetExpire" DROP NOT NULL,
ALTER COLUMN "resetExpire" DROP DEFAULT;