import type { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

type RegisterRequestBody = {
  name: string;
  email: string;
  password: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body as RegisterRequestBody;

    // Simple validation
    if (!name || name.length < 2) {
      return res.status(400).json({
        message: "Name muss mindestens 2 Zeichen lang sein",
      });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        message: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Passwort muss mindestens 6 Zeichen lang sein",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Diese E-Mail-Adresse wird bereits verwendet",
      });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Don't send the password hash back
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Ein Fehler ist bei der Registrierung aufgetreten",
    });
  }
}
