-- DropForeignKey
ALTER TABLE "ValidationLog" DROP CONSTRAINT "ValidationLog_ticketId_fkey";

-- AlterTable
ALTER TABLE "ValidationLog" ALTER COLUMN "ticketId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ValidationLog" ADD CONSTRAINT "ValidationLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
