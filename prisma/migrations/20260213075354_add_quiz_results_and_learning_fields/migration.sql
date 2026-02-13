-- AlterTable
ALTER TABLE "LearningProgress" ADD COLUMN     "lastQuizAt" TIMESTAMP(3),
ADD COLUMN     "lastQuizScore" INTEGER;

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQs" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "skillTier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizResult_userId_moduleId_idx" ON "QuizResult"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
