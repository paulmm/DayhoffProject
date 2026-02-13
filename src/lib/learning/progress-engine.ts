import { prisma } from "@/lib/prisma";
import { SkillLevel } from "@prisma/client";

/**
 * Deduplicates and pushes a concept to the conceptsExplored array.
 */
export async function trackConceptExplored(
  userId: string,
  moduleId: string,
  concept: string
): Promise<void> {
  const progress = await prisma.learningProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  const existing = progress?.conceptsExplored ?? [];
  if (existing.includes(concept)) return;

  await prisma.learningProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: {
      conceptsExplored: { push: concept },
    },
    create: {
      userId,
      moduleId,
      conceptsExplored: [concept],
    },
  });
}

/**
 * Deduplicates and pushes an insight to the insightsUnlocked array.
 * Triggered on milestones: first question, exploring deep-dive topics, viewing case studies.
 */
export async function trackInsightUnlocked(
  userId: string,
  moduleId: string,
  insight: string
): Promise<void> {
  const progress = await prisma.learningProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  const existing = progress?.insightsUnlocked ?? [];
  if (existing.includes(insight)) return;

  await prisma.learningProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: {
      insightsUnlocked: { push: insight },
    },
    create: {
      userId,
      moduleId,
      insightsUnlocked: [insight],
    },
  });
}

/**
 * Deduplicates and pushes an exercise ID to the exercisesCompleted array.
 */
export async function trackExerciseCompleted(
  userId: string,
  moduleId: string,
  exerciseId: string
): Promise<void> {
  const progress = await prisma.learningProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  const existing = progress?.exercisesCompleted ?? [];
  if (existing.includes(exerciseId)) return;

  await prisma.learningProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: {
      exercisesCompleted: { push: exerciseId },
    },
    create: {
      userId,
      moduleId,
      exercisesCompleted: [exerciseId],
    },
  });
}

/**
 * Checks progression thresholds and updates skillLevel.
 * Returns the new level string if changed, null otherwise.
 *
 * | From         | To           | Requirements                                                       |
 * |--------------|--------------|---------------------------------------------------------------------|
 * | NOVICE       | BEGINNER     | 3+ questions asked, 1+ concept explored                            |
 * | BEGINNER     | INTERMEDIATE | (Quiz >= 70% OR 1+ exercise completed) AND 5+ concepts explored    |
 * | INTERMEDIATE | ADVANCED     | (Quiz >= 85% OR 2+ exercises completed) AND 10+ questions, 8+ concepts |
 */
export async function evaluateSkillProgression(
  userId: string,
  moduleId: string
): Promise<SkillLevel | null> {
  const progress = await prisma.learningProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  if (!progress) return null;

  const { skillLevel, questionsAsked, conceptsExplored, lastQuizScore, exercisesCompleted } =
    progress;
  const conceptCount = conceptsExplored.length;
  const exerciseCount = exercisesCompleted.length;

  let newLevel: SkillLevel | null = null;

  if (
    skillLevel === "NOVICE" &&
    questionsAsked >= 3 &&
    conceptCount >= 1
  ) {
    newLevel = "BEGINNER";
  } else if (
    skillLevel === "BEGINNER" &&
    ((lastQuizScore ?? 0) >= 70 || exerciseCount >= 1) &&
    conceptCount >= 5
  ) {
    newLevel = "INTERMEDIATE";
  } else if (
    skillLevel === "INTERMEDIATE" &&
    ((lastQuizScore ?? 0) >= 85 || exerciseCount >= 2) &&
    questionsAsked >= 10 &&
    conceptCount >= 8
  ) {
    newLevel = "ADVANCED";
  }

  if (newLevel) {
    await prisma.learningProgress.update({
      where: { userId_moduleId: { userId, moduleId } },
      data: { skillLevel: newLevel },
    });
  }

  return newLevel;
}
