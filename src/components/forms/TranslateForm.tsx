import { useState } from "react";
import { LuGlobe, LuLoader } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

// List of supported languages
const SUPPORTED_LANGUAGES = [
  { code: "en", name: "Englisch" },
  { code: "es", name: "Spanisch" },
  { code: "fr", name: "Französisch" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italienisch" },
  { code: "pt", name: "Portugiesisch" },
  { code: "ru", name: "Russisch" },
  { code: "zh", name: "Chinesisch" },
  { code: "ja", name: "Japanisch" },
  { code: "ko", name: "Koreanisch" },
  { code: "ar", name: "Arabisch" },
] as const;

interface TranslateFormProps {
  formId: string;
  onTranslationComplete?: () => void;
}

export function TranslateForm({
  formId,
  onTranslationComplete,
}: TranslateFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (languageCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/forms/${formId}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetLanguage: languageCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Formular konnte nicht übersetzt werden");
      }

      onTranslationComplete?.();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to translate form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
      >
        <LuGlobe className="w-4 h-4" />
        <span>Übersetzen</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-56 rounded-lg bg-card shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-muted/20"
          >
            <div className="p-2">
              <h3 className="text-sm font-medium text-foreground px-3 py-2">
                Sprache auswählen
              </h3>
              {error && (
                <p className="text-xs text-red-500 px-3 py-1">
                  {error === "Failed to translate form"
                    ? "Formular konnte nicht übersetzt werden"
                    : error}
                </p>
              )}
              <div className="mt-2 space-y-1">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleTranslate(language.code)}
                    disabled={isLoading}
                    className="w-full flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <LuLoader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      language.name
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
