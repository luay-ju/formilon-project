import { NextPage, GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { prisma } from "@/lib/prisma";
import {
  LuChevronLeft,
  LuChevronRight,
  LuLoader,
  LuCheck,
  LuArrowRight,
  LuStar,
} from "react-icons/lu";
import { create } from "zustand";
import { LinearScaleQuestion } from "@/components/forms/questions/LinearScaleQuestion";
import { LanguageSelector } from "@/components/forms/LanguageSelector";

interface FormQuestion {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  properties: {
    options?: Array<{
      id: string;
      label: string;
      value: string;
      emoji?: string;
    }>;
    allowMultiple?: boolean;
    maxEmoji?: string;
    minEmoji?: string;
  } & Partial<
    LinearScaleProperties & RatingProperties & NumberProperties & DateProperties
  >;
}

interface FormFields {
  answers: Record<string, string | string[]>;
}

interface Translation {
  title: string;
  description: string | null;
  questions: Array<{
    id: string;
    title: string;
    description: string | null;
    properties?: {
      options?: Array<{
        id: string;
        label: string;
        value: string;
        emoji?: string;
      }>;
      maxEmoji?: string;
      maxLabel?: string;
      maxValue?: number;
      minEmoji?: string;
      minLabel?: string;
      minValue?: number;
      maxRating?: number;
      ratingType?: string;
    };
  }>;
  welcomeScreen: {
    title: string;
    description?: string;
    buttonText: string;
  } | null;
  thankyouScreen: {
    title: string;
    description?: string;
  } | null;
}

interface FormTranslations {
  [key: string]: Translation;
}

interface FormData {
  id: string;
  title: string;
  description?: string;
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
  translations?: FormTranslations;
  questions: FormQuestion[];
}

interface FormAnswers {
  [questionId: string]: string | string[];
}

interface FormStore {
  currentQuestionIndex: number;
  answers: FormAnswers;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, value: string | string[]) => void;
  isCompleted: boolean;
  setIsCompleted: (value: boolean) => void;
}

const useFormStore = create<FormStore>((set) => ({
  currentQuestionIndex: -1, // -1 represents welcome screen
  answers: {},
  setCurrentQuestionIndex: (index: number) =>
    set({ currentQuestionIndex: index }),
  setAnswer: (questionId: string, value: string | string[]) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),
  isCompleted: false,
  setIsCompleted: (value: boolean) => set({ isCompleted: value }),
}));

const QUESTION_TYPES = {
  short_text: "short_text",
  long_text: "long_text",
  multiple_choice: "multiple_choice",
  checkboxes: "checkboxes",
  dropdown: "dropdown",
  multi_select: "multi_select",
  number: "number",
  email: "email",
  phone: "phone",
  link: "link",
  file_upload: "file_upload",
  date: "date",
  linear_scale: "linear_scale",
  matrix: "matrix",
  rating: "rating",
  payment: "payment",
  signature: "signature",
  ranking: "ranking",
} as const;

interface LinearScaleProperties {
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
}

interface RatingProperties {
  maxRating?: number;
  ratingType?: "star" | "number";
}

interface NumberProperties {
  min?: number;
  max?: number;
  step?: number;
}

interface DateProperties {
  minDate?: string;
  maxDate?: string;
  dateFormat?: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.id || typeof params.id !== "string") {
    return {
      notFound: true,
    };
  }

  try {
    const form = await prisma.form.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!form) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        initialForm: JSON.parse(JSON.stringify(form)),
      },
    };
  } catch (error) {
    console.error("Error fetching form:", error);
    return {
      notFound: true,
    };
  }
};

const FormSubmission: NextPage<{ initialForm: FormData }> = ({
  initialForm,
}) => {
  const router = useRouter();
  const { id } = router.query;
  const [form] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("de");
  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setAnswer,
    isCompleted,
    setIsCompleted,
  } = useFormStore();

  const { register, handleSubmit } = useForm<FormFields>();

  // Get available languages from form translations
  const availableLanguages = form?.translations
    ? ["de", ...Object.keys(form.translations)]
    : ["de"];

  // Get translated content based on current language
  const getTranslatedContent = () => {
    if (!form) return null;
    if (currentLanguage === "de" || !form.translations) {
      return {
        title: form.title,
        description: form.description,
        questions: form.questions,
        welcomeScreen: form.welcomeScreen,
        thankyouScreen: form.thankyouScreen,
      };
    }

    const translations = form.translations;
    const currentTranslation = translations[currentLanguage];

    if (!currentTranslation) return null;

    // Create a map of question translations by ID
    const questionTranslations = new Map(
      currentTranslation.questions.map((q) => [q.id, q])
    );

    return {
      title: currentTranslation.title,
      description: currentTranslation.description,
      welcomeScreen: currentTranslation.welcomeScreen || form.welcomeScreen,
      thankyouScreen: currentTranslation.thankyouScreen || form.thankyouScreen,
      questions: form.questions.map((q) => {
        const translation = questionTranslations.get(q.id);
        if (!translation) return q;

        return {
          ...q,
          title: translation.title,
          description: translation.description,
          properties: {
            ...q.properties,
            ...(translation.properties && {
              options: translation.properties.options || q.properties.options,
              maxEmoji:
                translation.properties.maxEmoji || q.properties.maxEmoji,
              maxLabel:
                translation.properties.maxLabel || q.properties.maxLabel,
              maxValue:
                translation.properties.maxValue || q.properties.maxValue,
              minEmoji:
                translation.properties.minEmoji || q.properties.minEmoji,
              minLabel:
                translation.properties.minLabel || q.properties.minLabel,
              minValue:
                translation.properties.minValue || q.properties.minValue,
              maxRating:
                translation.properties.maxRating || q.properties.maxRating,
              ratingType:
                translation.properties.ratingType || q.properties.ratingType,
            }),
          },
        };
      }),
    };
  };

  const translatedContent = getTranslatedContent();

  if (!form || !translatedContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <LuLoader className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  const currentQuestion = translatedContent.questions[currentQuestionIndex];

  const handleNext = () => {
    if (
      translatedContent &&
      currentQuestionIndex === translatedContent.questions.length - 1
    ) {
      handleSubmit(onSubmit)();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > -1) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const onSubmit = async () => {
    if (!id || !form) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submissions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: id,
          completed: true,
          metadata: {
            userAgent: window.navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value: Array.isArray(value) ? value.join(", ") : String(value),
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form");
      }

      await response.json();
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: form.theme?.backgroundColor || "#ffffff",
        color: form.theme?.textColor || "#000000",
      }}
    >
      {/* Language selector in header */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector
          currentLanguage={currentLanguage}
          availableLanguages={availableLanguages}
          onLanguageChange={setCurrentLanguage}
        />
      </div>

      {/* Progress bar */}
      {currentQuestionIndex >= 0 && !isCompleted && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{
              width: `${
                ((currentQuestionIndex + 1) /
                  translatedContent.questions.length) *
                100
              }%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-16">
        <AnimatePresence mode="wait">
          {currentQuestionIndex === -1 && !isCompleted && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">
                {translatedContent.welcomeScreen?.title ||
                  translatedContent.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {translatedContent.welcomeScreen?.description ||
                  translatedContent.description}
              </p>
              <button
                onClick={() => setCurrentQuestionIndex(0)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                {translatedContent.welcomeScreen?.buttonText || "Start"}{" "}
                <LuArrowRight />
              </button>
            </motion.div>
          )}

          {currentQuestionIndex >= 0 && !isCompleted && currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.description && (
                  <p className="text-muted-foreground">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {/* Question input based on type */}
              <div className="space-y-4">
                {currentQuestion.type === QUESTION_TYPES.short_text && (
                  <input
                    type="text"
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                    })}
                    onChange={(e) =>
                      setAnswer(currentQuestion.id, e.target.value)
                    }
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                    placeholder="Geben Sie hier Ihre Antwort ein"
                  />
                )}

                {currentQuestion.type === QUESTION_TYPES.long_text && (
                  <textarea
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                    })}
                    onChange={(e) =>
                      setAnswer(currentQuestion.id, e.target.value)
                    }
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background min-h-[150px]"
                    placeholder="Geben Sie hier Ihre Antwort ein"
                  />
                )}

                {(currentQuestion.type === QUESTION_TYPES.multiple_choice ||
                  currentQuestion.type === QUESTION_TYPES.checkboxes) && (
                  <div className="space-y-2">
                    {currentQuestion.properties.options?.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 p-4 rounded-lg border border-input bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <input
                          type={
                            currentQuestion.type ===
                            QUESTION_TYPES.multiple_choice
                              ? "radio"
                              : "checkbox"
                          }
                          {...register(`answers.${currentQuestion.id}`, {
                            required: currentQuestion.required,
                          })}
                          value={option.value}
                          checked={
                            currentQuestion.type ===
                            QUESTION_TYPES.multiple_choice
                              ? answers[currentQuestion.id] === option.value
                              : (
                                  (answers[currentQuestion.id] as string[]) ||
                                  []
                                ).includes(option.value)
                          }
                          onChange={(e) =>
                            setAnswer(
                              currentQuestion.id,
                              currentQuestion.type ===
                                QUESTION_TYPES.multiple_choice
                                ? option.value
                                : e.target.checked
                                ? [
                                    ...((answers[
                                      currentQuestion.id
                                    ] as string[]) || []),
                                    option.value,
                                  ]
                                : (
                                    (answers[currentQuestion.id] as string[]) ||
                                    []
                                  ).filter((v) => v !== option.value)
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QUESTION_TYPES.dropdown && (
                  <select
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                    })}
                    onChange={(e) =>
                      setAnswer(currentQuestion.id, e.target.value)
                    }
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                  >
                    <option value="">Option auswählen</option>
                    {currentQuestion.properties.options?.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {currentQuestion.type === QUESTION_TYPES.multi_select && (
                  <select
                    multiple
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                    })}
                    onChange={(e) =>
                      setAnswer(
                        currentQuestion.id,
                        Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        )
                      )
                    }
                    value={(answers[currentQuestion.id] as string[]) || []}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background min-h-[150px]"
                  >
                    {currentQuestion.properties.options?.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {currentQuestion.type === QUESTION_TYPES.number && (
                  <input
                    type="number"
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                      min: (currentQuestion.properties as NumberProperties).min,
                      max: (currentQuestion.properties as NumberProperties).max,
                    })}
                    onChange={(e) =>
                      setAnswer(currentQuestion.id, e.target.value)
                    }
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                    placeholder="Enter a number"
                    min={(currentQuestion.properties as NumberProperties).min}
                    max={(currentQuestion.properties as NumberProperties).max}
                    step={(currentQuestion.properties as NumberProperties).step}
                  />
                )}

                {currentQuestion.type === QUESTION_TYPES.email && (
                  <input
                    type="email"
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    onChange={(e) =>
                      setAnswer(currentQuestion.id, e.target.value)
                    }
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                    placeholder="email@beispiel.de"
                  />
                )}

                {currentQuestion.type === QUESTION_TYPES.phone && (
                  <input
                    type="tel"
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                    })}
                    onChange={(e) =>
                      setAnswer(currentQuestion.id, e.target.value)
                    }
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                    placeholder="+49 123 4567890"
                  />
                )}

                {currentQuestion.type === QUESTION_TYPES.link && (
                  <input
                    type="url"
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message:
                          "Must be a valid URL starting with http:// or https://",
                      },
                    })}
                    onChange={(e) =>
                      setAnswer(currentQuestion.id, e.target.value)
                    }
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                    placeholder="https://beispiel.de"
                  />
                )}

                {currentQuestion.type === QUESTION_TYPES.date && (
                  <input
                    type="date"
                    {...register(`answers.${currentQuestion.id}`, {
                      required: currentQuestion.required,
                    })}
                    onChange={(e) =>
                      setAnswer(currentQuestion.id, e.target.value)
                    }
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                    min={(currentQuestion.properties as DateProperties).minDate}
                    max={(currentQuestion.properties as DateProperties).maxDate}
                  />
                )}

                {currentQuestion.type === "emoji_selector" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {currentQuestion.properties.options?.map((option) => (
                      <label
                        key={option.id}
                        className="relative flex flex-col items-center gap-2 p-4 rounded-lg border border-input hover:bg-muted/5 cursor-pointer transition-all"
                      >
                        <input
                          type={
                            currentQuestion.properties.allowMultiple
                              ? "checkbox"
                              : "radio"
                          }
                          {...register(`answers.${currentQuestion.id}`, {
                            required: currentQuestion.required,
                          })}
                          value={option.id}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (currentQuestion.properties.allowMultiple) {
                              const currentValues =
                                (answers[currentQuestion.id] as string[]) || [];
                              setAnswer(
                                currentQuestion.id,
                                e.target.checked
                                  ? [...currentValues, value]
                                  : currentValues.filter((v) => v !== value)
                              );
                            } else {
                              setAnswer(currentQuestion.id, value);
                            }
                          }}
                        />
                        <span className="text-3xl">{option.emoji}</span>
                        <span className="text-sm text-muted-foreground text-center">
                          {option.label}
                        </span>
                        <div
                          className={`absolute inset-0 rounded-lg border-2 transition-colors ${
                            currentQuestion.properties.allowMultiple
                              ? (
                                  answers[currentQuestion.id] as string[]
                                )?.includes(option.id)
                                ? "border-primary"
                                : "border-transparent"
                              : answers[currentQuestion.id] === option.id
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                        />
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QUESTION_TYPES.linear_scale && (
                  <LinearScaleQuestion
                    question={currentQuestion}
                    isPreview={true}
                    value={Number(answers[currentQuestion.id]) || undefined}
                    onChange={(value) =>
                      setAnswer(currentQuestion.id, value.toString())
                    }
                  />
                )}

                {currentQuestion.type === "rating" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {Array.from(
                        {
                          length: currentQuestion.properties.maxRating || 5,
                        },
                        (_, i) => i + 1
                      ).map((value) => (
                        <label key={value} className="cursor-pointer">
                          <input
                            type="radio"
                            {...register(`answers.${currentQuestion.id}`, {
                              required: currentQuestion.required,
                            })}
                            value={value}
                            className="sr-only"
                            onChange={(e) =>
                              setAnswer(currentQuestion.id, e.target.value)
                            }
                          />
                          <div
                            className={`
                              transition-colors duration-200
                              ${
                                currentQuestion.properties.ratingType ===
                                "number"
                                  ? `w-10 h-10 rounded-full flex items-center justify-center ${
                                      Number(answers[currentQuestion.id]) ===
                                      value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/5 border border-input hover:bg-muted/10"
                                    }`
                                  : `text-2xl ${
                                      Number(answers[currentQuestion.id]) >=
                                      value
                                        ? "text-yellow-400"
                                        : "text-muted hover:text-yellow-400"
                                    }`
                              }
                            `}
                          >
                            {currentQuestion.properties.ratingType ===
                            "number" ? (
                              value
                            ) : (
                              <LuStar
                                className={
                                  Number(answers[currentQuestion.id]) >= value
                                    ? "fill-current"
                                    : ""
                                }
                              />
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8">
                <button
                  onClick={handlePrevious}
                  className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LuChevronLeft /> Zurück
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    currentQuestion.required && !answers[currentQuestion.id]
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestionIndex ===
                  translatedContent.questions.length - 1 ? (
                    isSubmitting ? (
                      <>
                        <LuLoader className="animate-spin" /> Wird gesendet...
                      </>
                    ) : (
                      <>
                        Absenden <LuCheck />
                      </>
                    )
                  ) : (
                    <>
                      Weiter <LuChevronRight />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {isCompleted && (
            <motion.div
              key="thankyou"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
              >
                <LuCheck size={32} />
              </motion.div>
              <h1 className="text-4xl font-bold mb-4">
                {translatedContent.thankyouScreen?.title || "Vielen Dank!"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {translatedContent.thankyouScreen?.description ||
                  "Ihre Antwort wurde gespeichert."}
              </p>
              <button
                onClick={() => router.push(`/f/${id}/results`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                Ergebnisse ansehen 🤩 <LuArrowRight />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FormSubmission;
