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
