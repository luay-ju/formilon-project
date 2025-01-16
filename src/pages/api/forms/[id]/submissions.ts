import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Form ID is required" });
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id },
      select: {
        id: true,
        published: true,
      },
    });

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        formId: id,
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({ error: "Error fetching submissions" });
  }
}
