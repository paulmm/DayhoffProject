import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@dayhoff.bio" },
    update: {},
    create: {
      email: "demo@dayhoff.bio",
      name: "Demo User",
      role: "USER",
      onboardingCompleted: true,
    },
  });

  console.log("Seeded demo user:", demoUser.email);

  // Seed a completed demo experiment
  const completedExperiment = await prisma.experiment.upsert({
    where: { id: "demo-completed-experiment" },
    update: {
      status: "COMPLETED",
    },
    create: {
      id: "demo-completed-experiment",
      name: "SARS-CoV-2_RBD_antibody_design",
      status: "COMPLETED",
      goal: "Design de novo antibodies targeting the SARS-CoV-2 receptor binding domain (RBD) with high binding affinity and humanness scores",
      config: {
        workflowId: "de-novo-design",
        workflowName: "De Novo Protein Design",
        moduleIds: ["rfdiffusion", "proteinmpnn", "alphafold2"],
        timeEstimate: "2-4 hours",
        requiresGpu: true,
      },
      parameters: {
        target_pdb: "7JZM",
        chain_selection: "A",
        hotspot_residues: "A25,A30,A45",
        num_designs: 50,
        design_length: "50-100",
        noise_scale: 1.0,
        diffusion_steps: 50,
        proteinmpnn_temperature: 0.1,
        alphafold2_confidence_threshold: 0.7,
      },
      userId: demoUser.id,
    },
  });

  console.log("Seeded completed experiment:", completedExperiment.name);

  // Seed a completed run for the experiment
  const startedAt = new Date();
  startedAt.setHours(startedAt.getHours() - 3);
  const completedAt = new Date();
  completedAt.setHours(completedAt.getHours() - 1);

  await prisma.experimentRun.upsert({
    where: { id: "demo-completed-run" },
    update: {
      status: "COMPLETED",
      completedAt,
    },
    create: {
      id: "demo-completed-run",
      experimentId: completedExperiment.id,
      status: "COMPLETED",
      startedAt,
      completedAt,
      metrics: {
        totalDesigns: 50,
        passedDesigns: 50,
        successRate: 1.0,
        bestPLDDT: 0.92,
        bestBindingAffinity: -14.8,
        averageHumanness: 93,
        averagePLDDT: 0.85,
        runtime_seconds: 5,
        creditsUsed: 150,
      },
      logs: [
        { step: "rfdiffusion", status: "completed", message: "Generated 50 backbone structures" },
        { step: "proteinmpnn", status: "completed", message: "Designed sequences for 50 backbones" },
        { step: "alphafold2", status: "completed", message: "Predicted structures and scored 50 designs" },
      ],
    },
  });

  console.log("Seeded completed experiment run");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
