import { prisma } from "@/lib/prisma";

export interface UserLearningContext {
  learningMode: "socratic" | "direct";
  learnerType: "HANDS_ON" | "CONCEPTUAL" | "ASSESSMENT" | "EXPLORATORY";
  skillLevel: "NOVICE" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  conceptsExplored: string[];
  questionsAsked: number;
  exercisesCompleted: string[];
}

export async function getUserLearningContext(
  userId: string,
  moduleId?: string
): Promise<UserLearningContext> {
  const [aiSettings, learningProgress] = await Promise.all([
    prisma.aISettings.findUnique({ where: { userId } }),
    moduleId
      ? prisma.learningProgress.findUnique({
          where: { userId_moduleId: { userId, moduleId } },
        })
      : null,
  ]);

  return {
    learningMode: (aiSettings?.learningMode as "socratic" | "direct") ?? "socratic",
    learnerType: (aiSettings?.learnerType as UserLearningContext["learnerType"]) ?? "HANDS_ON",
    skillLevel: learningProgress?.skillLevel ?? "NOVICE",
    conceptsExplored: learningProgress?.conceptsExplored ?? [],
    questionsAsked: learningProgress?.questionsAsked ?? 0,
    exercisesCompleted: learningProgress?.exercisesCompleted ?? [],
  };
}
