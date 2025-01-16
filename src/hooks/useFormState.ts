import { useState, useEffect } from "react";
import { Question } from "@/types/Form";

interface Translation {
  title: string;
  description: string | null;
  questions: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
}

interface FormTranslations {
  [key: string]: Translation;
}

export interface FormState {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  customSlug?: string;
  welcomeScreen?: {
    title: string;
    description?: string;
    buttonText: string;
  };
  thankyouScreen?: {
    title: string;
    description?: string;
  };
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  settings?: Record<string, unknown>;
  translations?: FormTranslations;
  questions: Question[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function useFormState(formId: string) {
  const [form, setForm] = useState<FormState | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (formId) {
      fetch(`/api/forms/${formId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Original Form data: ", data);
          setForm(data);
        })
        .catch((error) => {
          console.error("Error fetching form:", error);
        });
    }
  }, [formId]);

  const updateForm = (updates: Partial<FormState>) => {
    if (!form) return;
    setForm({ ...form, ...updates });
  };

  const addQuestion = (
    type: Question["type"],
    properties: Record<string, unknown> = {},
    index?: number
  ) => {
    if (!form) return;

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      title: "Untitled Question",
      required: false,
      properties,
      order: index !== undefined ? index + 1 : form.questions.length,
    };

    const updatedQuestions = [...form.questions];
    if (index !== undefined) {
      updatedQuestions.splice(index + 1, 0, newQuestion);
      // Update order for questions after the inserted one
      for (let i = index + 2; i < updatedQuestions.length; i++) {
        updatedQuestions[i].order = i;
      }
    } else {
      updatedQuestions.push(newQuestion);
    }

    setForm({ ...form, questions: updatedQuestions });
    setActiveQuestionId(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    if (!form) return;

    const questionIndex = form.questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) return;

    const updatedQuestions = [...form.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      ...updates,
    };

    setForm({ ...form, questions: updatedQuestions });
  };

  const deleteQuestion = (questionId: string) => {
    if (!form) return;

    const updatedQuestions = form.questions.filter((q) => q.id !== questionId);
    // Update order for remaining questions
    updatedQuestions.forEach((q, index) => {
      q.order = index;
    });

    setForm({ ...form, questions: updatedQuestions });
    setActiveQuestionId(null);
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    if (!form || toIndex < 0 || toIndex >= form.questions.length) return;

    const updatedQuestions = [...form.questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);

    // Update order for all questions
    updatedQuestions.forEach((q, index) => {
      q.order = index;
    });

    setForm({ ...form, questions: updatedQuestions });
  };

  const saveForm = async () => {
    if (!form) return;

    const response = await fetch(`/api/forms/${formId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      throw new Error("Failed to save form");
    }

    const updatedForm = await response.json();
    setForm(updatedForm);
  };

  return {
    form,
    activeQuestionId,
    setActiveQuestionId,
    updateForm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    saveForm,
  };
}
