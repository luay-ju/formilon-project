import { useState } from "react";
import { FormState } from "@/hooks/useFormState";
import { LanguageSelector } from "./LanguageSelector";

interface FormPreviewProps {
  form: FormState;
  onClose: () => void;
}

export function FormPreview({ form, onClose }: FormPreviewProps) {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Get available languages from form translations
  const availableLanguages = form?.translations
    ? ["en", ...Object.keys(form.translations)]
    : ["en"];

  // Get translated content based on current language
  const getTranslatedContent = () => {
    if (currentLanguage === "en" || !form?.translations) {
      return {
        title: form?.title || "",
        description: form?.description || "",
        questions: form?.questions || [],
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
      questions: form.questions.map((q) => {
        const translation = questionTranslations.get(q.id);
        return translation
          ? {
              ...q,
              title: translation.title,
              description: translation.description,
            }
          : q;
      }),
    };
  };

  const translatedContent = getTranslatedContent();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container max-w-3xl mx-auto py-8">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Formularvorschau</h2>
              <div className="flex items-center gap-4">
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  availableLanguages={availableLanguages}
                  onLanguageChange={setCurrentLanguage}
                />
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  {translatedContent?.title}
                </h1>
                {translatedContent?.description && (
                  <p className="text-muted-foreground">
                    {translatedContent.description}
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {translatedContent?.questions.map((question) => (
                  <div
                    key={question.id}
                    className="p-6 rounded-lg border border-border/40 bg-card"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            {question.title}
                          </h3>
                          {question.description && (
                            <p className="text-sm text-muted-foreground">
                              {question.description}
                            </p>
                          )}
                        </div>
                        {question.required && (
                          <span className="text-sm text-red-500">
                            *Erforderlich
                          </span>
                        )}
                      </div>

                      {/* Question preview content would go here */}
                      <div className="mt-4 text-sm text-muted-foreground">
                        [Fragetyp: {question.type}]
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
