import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { LuPlus, LuArrowLeft, LuEye, LuSave } from "react-icons/lu";
import { QuestionCard } from "@/components/forms/QuestionCard";
import { ElementPicker } from "@/components/forms/ElementPicker";
import { ShortTextQuestion } from "@/components/forms/questions/ShortTextQuestion";
import { MultipleChoiceQuestion } from "@/components/forms/questions/MultipleChoiceQuestion";
import { useFormState } from "@/hooks/useFormState";
import { useQuestionOptions } from "@/hooks/useQuestionOptions";
import { Question } from "@/types/Form";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "@/components/UI/Toast/Toast";
import { EmojiSelectorQuestion } from "@/components/forms/questions/EmojiSelectorQuestion";
import { LinearScaleQuestion } from "@/components/forms/questions/LinearScaleQuestion";
import { RatingQuestion } from "@/components/forms/questions/RatingQuestion";
import { TranslateForm } from "@/components/forms/TranslateForm";
import { LanguageSelector } from "@/components/forms/LanguageSelector";
import { FormPreview } from "@/components/forms/FormPreview";

interface QuestionPreviewProps {
  question: Question;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddBelow: () => void;
  onUpdateQuestion: (updates: Partial<Question>) => void;
}

const QuestionPreview = ({
  question,
  index,
  isActive,
  onActivate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddBelow,
  onUpdateQuestion,
}: QuestionPreviewProps) => {
  const questionOptions = useQuestionOptions(question, onUpdateQuestion);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <div
        className={`
          group rounded-xl border bg-card backdrop-blur-sm
          transition-all duration-200 
          ${
            isActive
              ? "border-primary/20 shadow-sm ring-1 ring-primary/5"
              : "border-muted/50 hover:border-muted hover:shadow-sm"
          }
        `}
      >
        <QuestionCard
          question={question}
          isActive={isActive}
          index={index}
          onActivate={onActivate}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onAddQuestionBelow={onAddBelow}
          onUpdateQuestion={onUpdateQuestion}
        >
          {question.type === "short_text" && (
            <ShortTextQuestion question={question} isPreview={!isActive} />
          )}
          {(question.type === "multiple_choice" ||
            question.type === "checkboxes" ||
            question.type === "dropdown" ||
            question.type === "multi_select") && (
            <MultipleChoiceQuestion
              question={question}
              isPreview={!isActive}
              onUpdateOption={questionOptions.updateOption}
              onAddOption={questionOptions.addOption}
              onDeleteOption={questionOptions.deleteOption}
              onMoveOption={questionOptions.moveOption}
            />
          )}
          {question.type === "emoji_selector" && (
            <EmojiSelectorQuestion
              question={question}
              isPreview={!isActive}
              onUpdateOptions={(options) =>
                onUpdateQuestion({
                  properties: { ...question.properties, options },
                })
              }
            />
          )}
          {question.type === "linear_scale" && (
            <LinearScaleQuestion
              question={question}
              isPreview={!isActive}
              onUpdateProperties={(updates) =>
                onUpdateQuestion({
                  properties: { ...question.properties, ...updates },
                })
              }
            />
          )}
          {question.type === "rating" && (
            <RatingQuestion
              question={question}
              isPreview={!isActive}
              onUpdateProperties={(updates) =>
                onUpdateQuestion({
                  properties: { ...question.properties, ...updates },
                })
              }
            />
          )}
        </QuestionCard>
      </div>
    </motion.div>
  );
};

interface QuestionProperties {
  options?: Array<{
    id: string;
    label: string;
    value: string;
    emoji?: string;
  }>;
  minLabel?: string;
  maxLabel?: string;
  minValue?: number;
  maxValue?: number;
  maxRating?: number;
  ratingType?: string;
}

interface Translation {
  title: string;
  description: string | null;
  questions: Array<{
    id: string;
    title: string;
    description: string | null;
    properties?: Partial<QuestionProperties>;
  }>;
}

interface FormTranslations {
  [key: string]: Translation;
}

interface TranslatedContent {
  title: string;
  description: string | null;
  questions: Question[];
}

const FormBuilder: NextPage = () => {
  const router = useRouter();
  const [showElementPicker, setShowElementPicker] = useState(false);
  const [addQuestionIndex, setAddQuestionIndex] = useState<
    number | undefined
  >();
  const [isSaving, setIsSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("de");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showThankYouScreen, setShowThankYouScreen] = useState(false);

  // Wait for router to be ready before initializing form state
  useEffect(() => {
    if (router.isReady) {
      setMounted(true);
    }
  }, [router.isReady]);

  const {
    form,
    activeQuestionId,
    setActiveQuestionId,
    updateForm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    saveForm,
  } = useFormState(router.query.id as string);
  console.log("Form data: ", form);
  const handleAddQuestion = (type: Question["type"]) => {
    const defaultProperties: Record<string, unknown> = {};
    if (type === "emoji_selector") {
      defaultProperties.options = [
        {
          id: crypto.randomUUID(),
          emoji: "😊",
          label: "Option 1",
          value: "option_1",
        },
      ];
    } else if (
      ["multiple_choice", "checkboxes", "dropdown", "multi_select"].includes(
        type
      )
    ) {
      defaultProperties.options = [
        { id: "1", label: "Option 1", value: "option_1" },
      ];
    } else if (type === "linear_scale") {
      defaultProperties.minValue = 1;
      defaultProperties.maxValue = 5;
      defaultProperties.minLabel = "";
      defaultProperties.maxLabel = "";
    } else if (type === "rating") {
      defaultProperties.maxRating = 5;
      defaultProperties.ratingType = "star";
    }

    addQuestion(type, defaultProperties, addQuestionIndex);
    setShowElementPicker(false);
    setAddQuestionIndex(undefined);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveForm();
      setToast({ message: "Änderungen gespeichert", type: "success" });
    } catch (error: unknown) {
      console.error("Error saving form:", error);
      setToast({ message: "Speichern fehlgeschlagen", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Get available languages from form translations
  const availableLanguages = form?.translations
    ? ["de", ...Object.keys(form.translations as FormTranslations)]
    : ["de"];

  // Get translated content based on current language
  const getTranslatedContent = (): TranslatedContent | null => {
    if (currentLanguage === "de" || !form?.translations) {
      return {
        title: form?.title || "",
        description: form?.description || "",
        questions: form?.questions || [],
      };
    }

    const translations = form.translations as FormTranslations;
    const currentTranslation = translations[currentLanguage];

    if (!currentTranslation) return null;

    // Create a map of question translations by ID
    const questionTranslations = new Map(
      currentTranslation.questions.map((q) => [q.id, q])
    );

    return {
      title: currentTranslation.title,
      description: currentTranslation.description,
      questions: form.questions.map((q) => {
        const translation = questionTranslations.get(q.id);
        if (!translation) return q;

        // Deep clone the question to avoid mutating the original
        const translatedQuestion = { ...q } as Question;
        const properties = translatedQuestion.properties as QuestionProperties;

        // Apply basic translations
        translatedQuestion.title = translation.title;
        translatedQuestion.description = translation.description;

        // Apply translations to properties
        if (translation.properties && properties) {
          translatedQuestion.properties = { ...properties };

          // Handle options translation for multiple choice, checkboxes, etc.
          const translationOptions = translation.properties.options;
          const propertyOptions = properties.options;

          if (
            Array.isArray(translationOptions) &&
            Array.isArray(propertyOptions) &&
            translationOptions.length > 0 &&
            propertyOptions.length > 0
          ) {
            translatedQuestion.properties = {
              ...properties,
              options: translationOptions.map((translatedOption, index) => ({
                ...propertyOptions[index],
                label: translatedOption.label,
                ...(translatedOption.emoji && {
                  emoji: translatedOption.emoji,
                }),
              })),
            };
          }

          // Handle linear scale translations
          if (translation.properties.minLabel !== undefined) {
            translatedQuestion.properties = {
              ...properties,
              minLabel: translation.properties.minLabel,
            };
          }
          if (translation.properties.maxLabel !== undefined) {
            translatedQuestion.properties = {
              ...properties,
              maxLabel: translation.properties.maxLabel,
            };
          }
        }

        return translatedQuestion;
      }),
    };
  };

  const translatedContent = getTranslatedContent();

  const handlePreviewClick = () => {
    const formId = router.query.id as string;
    // Open in new tab to preserve the editor state
    window.open(`/s/${formId}`, "_blank");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="sticky top-0 z-10 backdrop-blur-sm mb-8 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="p-2 hover:bg-muted/20 rounded-full text-muted-foreground hover:text-foreground transition-all"
              aria-label="Go back"
            >
              <LuArrowLeft size={20} />
            </motion.button>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={translatedContent?.title || ""}
                onChange={(e) =>
                  currentLanguage === "de" &&
                  updateForm({ title: e.target.value })
                }
                className="text-3xl font-medium bg-transparent border-none focus:outline-none w-full placeholder:text-gray-300"
                placeholder="Unbenanntes Formular"
                readOnly={currentLanguage !== "de"}
              />
              <input
                type="text"
                value={translatedContent?.description || ""}
                onChange={(e) =>
                  currentLanguage === "de" &&
                  updateForm({ description: e.target.value })
                }
                className="text-sm text-gray-500 bg-transparent border-none focus:outline-none w-full placeholder:text-gray-300"
                placeholder="Beschreibung hinzufügen"
                readOnly={currentLanguage !== "de"}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 py-2 px-4 bg-card/80 rounded-lg border border-muted/50 shadow-sm">
            <TranslateForm
              formId={router.query.id as string}
              onTranslationComplete={() => {
                setToast({
                  message: "Formular erfolgreich übersetzt",
                  type: "success",
                });
              }}
            />
            <div className="w-px h-4 bg-muted" />
            <LanguageSelector
              currentLanguage={currentLanguage}
              availableLanguages={availableLanguages}
              onLanguageChange={setCurrentLanguage}
            />
          </div>
        </header>

        <main className="space-y-6">
          <AnimatePresence>
            {translatedContent?.questions.map((question, index) => (
              <QuestionPreview
                key={question.id}
                question={question}
                index={index}
                isActive={question.id === activeQuestionId}
                onActivate={() => setActiveQuestionId(question.id)}
                onDelete={() => deleteQuestion(question.id)}
                onMoveUp={() => moveQuestion(index, index - 1)}
                onMoveDown={() => moveQuestion(index, index + 1)}
                onAddBelow={() => {
                  setAddQuestionIndex(index);
                  setShowElementPicker(true);
                }}
                onUpdateQuestion={(updates) =>
                  currentLanguage === "de" &&
                  updateQuestion(question.id, updates)
                }
              />
            ))}
          </AnimatePresence>

          {form?.questions.length === 0 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowElementPicker(true)}
              className="w-full p-8 rounded-xl border-2 border-dashed border-muted hover:border-muted-foreground hover:bg-muted/5 transition-all duration-200 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            >
              <LuPlus size={20} />
              <span className="font-medium">Erste Frage hinzufügen</span>
            </motion.button>
          )}
        </main>

        <nav className="fixed bottom-8 right-8 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePreviewClick}
            className="px-4 py-2 rounded-lg bg-card shadow-sm hover:shadow-md border border-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
          >
            <LuEye size={16} />
            <span>Vorschau</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <LuSave size={16} />
                </motion.div>
                <span>Wird gespeichert...</span>
              </div>
            ) : (
              <>
                <LuSave size={16} />
                <span>Speichern</span>
              </>
            )}
          </motion.button>
        </nav>

        <AnimatePresence>
          {showElementPicker && (
            <ElementPicker
              onSelect={handleAddQuestion}
              onClose={() => {
                setShowElementPicker(false);
                setAddQuestionIndex(undefined);
              }}
            />
          )}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
          {showPreview && form && (
            <FormPreview form={form} onClose={() => setShowPreview(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FormBuilder;
