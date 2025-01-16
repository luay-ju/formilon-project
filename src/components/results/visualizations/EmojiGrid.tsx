import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmojiAnalysis } from "../../../types/ResultsAnalytics";

interface EmojiGridProps {
  data: EmojiAnalysis;
  title: string;
  className?: string;
}

export const EmojiGrid: React.FC<EmojiGridProps> = ({
  data,
  title,
  className = "",
}) => {
  // Move hooks before any conditional returns
  const emojiSizes = useMemo(() => {
    try {
      if (!data?.mostUsed) return {};

      const maxCount = Math.max(...data.mostUsed.map((e) => e.count || 0));
      const minSize = 36;
      const maxSize = 72;
      const ratio = 0.8;

      return data.mostUsed.reduce(
        (acc, { emoji, count }) => ({
          ...acc,
          [emoji]: Math.max(
            minSize,
            Math.round(
              minSize + ((count || 0) / maxCount) * (maxSize - minSize) * ratio
            )
          ),
        }),
        {} as Record<string, number>
      );
    } catch (error) {
      console.error("Error calculating emoji sizes:", error);
      return {};
    }
  }, [data?.mostUsed]);

  const percentages = useMemo(() => {
    try {
      if (!data?.mostUsed || !data?.percentages) return {};

      return data.mostUsed.reduce(
        (acc, { emoji }) => ({
          ...acc,
          [emoji]: (data.percentages[emoji] || 0).toFixed(1),
        }),
        {} as Record<string, string>
      );
    } catch (error) {
      console.error("Error calculating percentages:", error);
      return {};
    }
  }, [data?.mostUsed, data?.percentages]);

  try {
    // Validate required data
    if (!data || !data.mostUsed || !data.percentages || !data.totalResponses) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Keine Emoji-Daten verfügbar
        </div>
      );
    }

    // Skip rendering if no valid data
    if (
      Object.keys(emojiSizes).length === 0 ||
      Object.keys(percentages).length === 0
    ) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Fehler bei der Verarbeitung der Emoji-Daten
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-card p-6 rounded-lg shadow-lg border border-border/50 hover:border-border/80 transition-colors ${className}`}
      >
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>

        {/* Enhanced Total Responses Card */}
        <div className="bg-muted/10 p-4 rounded-lg mb-6 hover:bg-muted/20 transition-colors">
          <p className="text-sm text-muted-foreground">Gesamtantworten</p>
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-2xl font-semibold text-foreground"
          >
            {data.totalResponses}
          </motion.p>
        </div>

        {/* Responsive Emoji Grid with better spacing */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {data.mostUsed.map(({ emoji, count }, index) => (
              <motion.div
                key={emoji}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="bg-muted/5 hover:bg-muted/10 p-4 rounded-lg flex flex-col items-center transition-all"
                whileHover={{ y: -2 }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="mb-3 select-none"
                  style={{
                    fontSize: `${emojiSizes[emoji]}px`,
                    lineHeight: 1,
                    filter: "saturate(1.1)",
                  }}
                  role="img"
                  aria-label={`Emoji: ${emoji}`}
                >
                  {emoji}
                </motion.div>

                {/* Enhanced Response Count */}
                <p className="text-sm font-medium mb-2 text-foreground">
                  {count} {count === 1 ? "Antwort" : "Antworten"}
                </p>

                {/* Improved Percentage Bar */}
                <div className="w-full h-2.5 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentages[emoji]}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-htw-green/90 hover:bg-htw-green rounded-full transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {percentages[emoji]}%
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Enhanced Empty State */}
        {data.mostUsed.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-12 bg-muted/5 rounded-lg"
          >
            <p className="text-lg">Noch keine Emoji-Antworten</p>
            <p className="text-sm mt-2">
              Antworten werden hier angezeigt, sobald sie gesammelt wurden
            </p>
          </motion.div>
        )}

        {/* Enhanced Accessibility Note */}
        <p className="text-xs text-muted-foreground mt-6 italic">
          Hinweis: Die Emoji-Größen zeigen die Auswahlhäufigkeit an — größere
          Emojis stehen für häufigere Auswahl
        </p>
      </motion.div>
    );
  } catch (error) {
    console.error("Error rendering EmojiGrid:", error);
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Fehler beim Anzeigen des Emoji-Rasters
      </div>
    );
  }
};
