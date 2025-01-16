import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

interface Answer {
  questionId: string;
  value: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { formId, completed, metadata, answers } = req.body;

  if (!formId) {
    return res.status(400).json({ error: "Form ID is required" });
  }

  try {
    // Verify the form exists
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true },
    });

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        formId,
        completed: completed || false,
        metadata,
        answers: {
          create: answers.map((answer: Answer) => ({
            questionId: answer.questionId,
            value: answer.value,
          })),
        },
      },
    });

    return res.status(200).json(submission);
  } catch (error) {
    console.error("Error creating submission:", error);
    return res.status(500).json({ error: "Error creating submission" });
  }
}
