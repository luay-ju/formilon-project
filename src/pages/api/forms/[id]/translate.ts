import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { Translate } from "@google-cloud/translate/build/src/v2";

if (
  !process.env.GOOGLE_CLOUD_PROJECT_ID ||
  !process.env.GOOGLE_CLOUD_PRIVATE_KEY ||
  !process.env.GOOGLE_CLOUD_CLIENT_EMAIL
) {
  throw new Error("Missing Google Cloud credentials");
}

const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

// Add interfaces for the screen types and properties
interface Screen {
  title: string | null;
  description: string | null;
}

interface QuestionProperties {
  options?: Array<{ label: string }>;
  minLabel?: string;
  maxLabel?: string;
}

// Update FormTranslation to allow string indexing
type FormTranslation = {
  title: string;
  description: string | null;
  welcomeScreen: Screen | null;
  thankyouScreen: Screen | null;
  questions: Array<{
    id: string;
    title: string;
    description: string | null;
    properties: QuestionProperties;
  }>;
  [key: string]: any; // Add index signature
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const formId = req.query.id as string;
    const { targetLanguage } = req.body;

    // Fetch the form
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { questions: true },
    });

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    if (form.userId !== session.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Enhanced text collection for translation
    const textsToTranslate: string[] = [];
    const translationMap = new Map<
      number,
      { path: string[]; original: string }
    >();
    let index = 0;

    // Add form basic fields
    const addTextForTranslation = (
      text: string | null | undefined,
      path: string[]
    ) => {
      if (text) {
        textsToTranslate.push(text);
        translationMap.set(index++, { path, original: text });
      }
    };

    // Type assertions for screen properties
    const welcomeScreen = form.welcomeScreen as Screen | null;
    const thankyouScreen = form.thankyouScreen as Screen | null;

    // Add base form content
    addTextForTranslation(form.title, ["title"]);
    addTextForTranslation(form.description, ["description"]);
    addTextForTranslation(welcomeScreen?.title, ["welcomeScreen", "title"]);
    addTextForTranslation(welcomeScreen?.description, [
      "welcomeScreen",
      "description",
    ]);
    addTextForTranslation(thankyouScreen?.title, ["thankyouScreen", "title"]);
    addTextForTranslation(thankyouScreen?.description, [
      "thankyouScreen",
      "description",
    ]);

    // Add questions and their properties
    form.questions.forEach((question, qIndex) => {
      const properties = question.properties as QuestionProperties;

      addTextForTranslation(question.title, [
        "questions",
        qIndex.toString(),
        "title",
      ]);
      addTextForTranslation(question.description, [
        "questions",
        qIndex.toString(),
        "description",
      ]);

      if (properties.options) {
        properties.options.forEach((option, oIndex) => {
          if (option && option.label) {
            addTextForTranslation(option.label, [
              "questions",
              qIndex.toString(),
              "properties",
              "options",
              oIndex.toString(),
              "label",
            ]);
          }
        });
      }

      if (properties.minLabel) {
        addTextForTranslation(properties.minLabel, [
          "questions",
          qIndex.toString(),
          "properties",
          "minLabel",
        ]);
      }

      if (properties.maxLabel) {
        addTextForTranslation(properties.maxLabel, [
          "questions",
          qIndex.toString(),
          "properties",
          "maxLabel",
        ]);
      }
    });

    // Translate all collected texts
    const [translations] = await translate.translate(textsToTranslate, {
      from: "de",
      to: targetLanguage,
    });
    const translatedTexts = Array.isArray(translations)
      ? translations
      : [translations];

    // Build translation object with proper typing
    const formTranslation: FormTranslation = {
      title: "",
      description: null,
      welcomeScreen: form.welcomeScreen
        ? { title: null, description: null }
        : null,
      thankyouScreen: form.thankyouScreen
        ? { title: null, description: null }
        : null,
      questions: form.questions.map((q) => ({
        id: q.id,
        title: "",
        description: null,
        properties: { ...(q.properties as QuestionProperties) },
      })),
    };

    // Map translations back to their proper places
    translatedTexts.forEach((translatedText, i) => {
      const mapping = translationMap.get(i);
      if (mapping) {
        let current = formTranslation;
        const lastIndex = mapping.path.length - 1;

        mapping.path.forEach((pathPart, pathIndex) => {
          if (pathIndex === lastIndex) {
            current[pathPart] = translatedText;
          } else {
            current = current[pathPart];
          }
        });
      }
    });

    // Type the translations object
    const existingTranslations =
      (form.translations as Record<string, FormTranslation> | null) || {};

    // Update form with new translation
    await prisma.form.update({
      where: { id: formId },
      data: {
        translations: {
          ...existingTranslations,
          [targetLanguage]: formTranslation,
        },
      },
    });

    return res.status(200).json({ translation: formTranslation });
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({ error: "Failed to translate form" });
  }
}
