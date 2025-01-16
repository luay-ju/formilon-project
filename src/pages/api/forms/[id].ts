import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const formId = req.query.id as string;

  switch (req.method) {
    case "GET":
      try {
        const form = await prisma.form.findUnique({
          where: { id: formId },
          include: {
            questions: {
              orderBy: {
                order: "asc",
              },
            },
            _count: {
              select: {
                submissions: true,
              },
            },
          },
        });

        if (!form) {
          return res.status(404).json({ error: "Form not found" });
        }

        // Check if the request is coming from the submission or results page
        const referer = req.headers.referer || "";
        const isPublicAccess =
          referer.includes("/s/") ||
          referer.includes("/results") ||
          req.query.mode === "submit";

        // If form is not published and not accessed from public pages, require authentication
        if (!form.published && !isPublicAccess) {
          const session = await getServerSession(req, res, authOptions);
          if (!session?.user || session.user.id !== form.userId) {
            return res.status(401).json({ error: "Unauthorized" });
          }
        }

        return res.status(200).json(form);
      } catch (error) {
        console.error("Error fetching form:", error);
        return res.status(500).json({ error: "Error fetching form" });
      }

    case "PUT":
    case "DELETE":
      // These operations require authentication
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Verify form ownership
      const userForm = await prisma.form.findFirst({
        where: {
          id: formId,
          userId: session.user.id,
        },
      });

      if (!userForm) {
        return res.status(404).json({ error: "Form not found" });
      }

      if (req.method === "PUT") {
        try {
          const data = req.body;
          // Remove questions and _count from the data object
          const { questions, _count, ...formData } = data;

          const updatedForm = await prisma.form.update({
            where: { id: formId },
            data: {
              ...formData,
              questions: {
                deleteMany: {},
                create: questions.map((q: any) => ({
                  type: q.type,
                  title: q.title,
                  order: q.order,
                  required: q.required ?? false,
                  properties: q.properties ?? {},
                  description: q.description ?? null,
                  logic: q.logic ?? null,
                })),
              },
            },
            include: {
              questions: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          });
          return res.status(200).json(updatedForm);
        } catch (error) {
          console.error("Error updating form:", error);
          return res.status(500).json({ error: "Error updating form" });
        }
      }

      if (req.method === "DELETE") {
        try {
          await prisma.form.delete({
            where: { id: formId },
          });
          return res.status(204).end();
        } catch (error) {
          console.error("Error deleting form:", error);
          return res.status(500).json({ error: "Error deleting form" });
        }
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
