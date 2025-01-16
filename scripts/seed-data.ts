import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("🌱 Seeding database with sample data...");

  try {
    // Create demo user
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@formilon.de" },
      update: {},
      create: {
        email: "demo@formilon.de",
        name: "Demo Benutzer",
        password: hashedPassword,
      },
    });

    console.log("✅ Demo user created");

    // Create sample form
    const sampleForm = await prisma.form.upsert({
      where: { customSlug: "kundenzufriedenheit" },
      update: {},
      create: {
        title: "Kundenzufriedenheit Umfrage",
        description: "Helfen Sie uns, unseren Service zu verbessern",
        published: true,
        customSlug: "kundenzufriedenheit",
        userId: demoUser.id,
        welcomeScreen: {
          title: "Willkommen zu unserer Umfrage",
          description:
            "Ihre Meinung ist uns wichtig. Die Umfrage dauert etwa 5 Minuten.",
          buttonText: "Umfrage starten",
        },
        thankyouScreen: {
          title: "Vielen Dank!",
          description: "Ihre Antworten wurden erfolgreich gespeichert.",
        },
        theme: {
          primaryColor: "#0066cc",
          backgroundColor: "#ffffff",
          fontFamily: "Inter",
        },
      },
    });

    console.log("✅ Sample form created");

    // Create sample questions
    const questions = [
      {
        order: 1,
        type: "rating",
        title: "Wie zufrieden sind Sie mit unserem Service?",
        description: "Bitte bewerten Sie auf einer Skala von 1-5",
        required: true,
        properties: {
          maxRating: 5,
          ratingType: "star",
        },
      },
      {
        order: 2,
        type: "text",
        title: "Was können wir verbessern?",
        description: "Ihre Vorschläge sind uns wichtig",
        required: false,
        properties: {
          multiline: true,
        },
      },
      {
        order: 3,
        type: "linear",
        title: "Wie wahrscheinlich ist es, dass Sie uns weiterempfehlen?",
        description:
          "Skala von 0 (unwahrscheinlich) bis 10 (sehr wahrscheinlich)",
        required: true,
        properties: {
          minValue: 0,
          maxValue: 10,
          minLabel: "Unwahrscheinlich",
          maxLabel: "Sehr wahrscheinlich",
        },
      },
    ];

    for (const question of questions) {
      await prisma.question.create({
        data: {
          ...question,
          formId: sampleForm.id,
        },
      });
    }

    console.log("✅ Sample questions created");

    // Create sample submissions
    const sampleResponses = [
      {
        rating: "4",
        improvement: "Schnellere Lieferzeiten wären gut",
        recommendation: "8",
      },
      { rating: "5", improvement: "Alles perfekt!", recommendation: "10" },
      {
        rating: "3",
        improvement: "Kundenservice könnte besser sein",
        recommendation: "6",
      },
    ];

    for (const response of sampleResponses) {
      const submission = await prisma.submission.create({
        data: {
          formId: sampleForm.id,
          completed: true,
          metadata: {
            browser: "Chrome",
            device: "Desktop",
            timestamp: new Date().toISOString(),
          },
        },
      });

      const questions = await prisma.question.findMany({
        where: { formId: sampleForm.id },
        orderBy: { order: "asc" },
      });

      // Create answers for each question
      await Promise.all(
        questions.map(async (question) => {
          let value = "";
          if (question.type === "rating") value = response.rating;
          else if (question.type === "text") value = response.improvement;
          else if (question.type === "linear") value = response.recommendation;

          await prisma.answer.create({
            data: {
              questionId: question.id,
              submissionId: submission.id,
              value,
            },
          });
        })
      );
    }

    console.log("✅ Sample submissions created");
    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
