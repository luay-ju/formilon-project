import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

async function setupDatabase() {
  console.log("🔧 Setting up database...");

  try {
    // Run Prisma migrations
    console.log("Running database migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });

    // Verify database connection
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Run the seeding script
    console.log("🌱 Running database seeding...");
    execSync("ts-node scripts/seed-data.ts", { stdio: "inherit" });

    await prisma.$disconnect();
    console.log("✅ Database setup completed successfully");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
