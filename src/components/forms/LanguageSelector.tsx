import { useState } from "react";
import { LuCheck } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { FaLanguage } from "react-icons/fa6";

// List of supported languages - keep in sync with TranslateForm
const SUPPORTED_LANGUAGES = [
  { code: "de", name: "Deutsch" },
  { code: "en", name: "Englisch" },
  { code: "es", name: "Spanisch" },
  { code: "fr", name: "Französisch" },
  { code: "it", name: "Italienisch" },
  { code: "pt", name: "Portugiesisch" },
  { code: "ru", name: "Russisch" },
  { code: "zh", name: "Chinesisch" },
  { code: "ja", name: "Japanisch" },
  { code: "ko", name: "Koreanisch" },
  { code: "ar", name: "Arabisch" },
] as const;

interface LanguageSelectorProps {
  currentLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (languageCode: string) => void;
}

export function LanguageSelector({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter languages to only show available ones plus English
  const displayLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.code === "de" || availableLanguages.includes(lang.code)
  );

  const currentLanguageName =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLanguage)?.name ||
    "German";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
      >
        <FaLanguage className="w-4 h-4" />
        <span>{currentLanguageName}</span>
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
              <div className="mt-2 space-y-1">
                {displayLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      onLanguageChange(language.code);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <span>{language.name}</span>
                    {currentLanguage === language.code && (
                      <LuCheck className="w-4 h-4" />
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
