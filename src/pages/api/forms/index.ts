import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  switch (req.method) {
    case "POST":
      try {
        const form = await prisma.form.create({
          data: {
            title: "Untitled Form",
            userId: session.user.id,
            published: false,
            questions: {
              create: [],
            },
            settings: {},
            theme: {
              primaryColor: "#0066ff",
              backgroundColor: "#ffffff",
              textColor: "#000000",
            },
          },
        });

        return res.status(201).json(form);
      } catch (error) {
        console.error("Error creating form:", error);
        return res.status(500).json({ error: "Error creating form" });
      }
      break;

    case "GET":
      try {
        const forms = await prisma.form.findMany({
          where: {
            userId: session.user.id,
          },
          include: {
            _count: {
              select: {
                submissions: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return res.status(200).json(forms);
      } catch (error) {
        console.error("Error fetching forms:", error);
        return res.status(500).json({ error: "Error fetching forms" });
      }
      break;

    default:
      res.setHeader("Allow", ["POST", "GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
