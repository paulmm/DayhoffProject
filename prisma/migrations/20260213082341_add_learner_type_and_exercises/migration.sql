-- AlterTable
ALTER TABLE "AISettings" ADD COLUMN     "learnerType" TEXT NOT NULL DEFAULT 'HANDS_ON';

-- AlterTable
ALTER TABLE "LearningProgress" ADD COLUMN     "exercisesCompleted" TEXT[];
