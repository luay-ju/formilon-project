import { motion } from "framer-motion";
import { TextAnalysis as TextAnalysisType } from "@/types/analytics";
import { BsChatSquareText, BsGraphUp } from "react-icons/bs";

interface TextAnalysisProps {
  analysis: TextAnalysisType;
  inView?: boolean;
}

export function TextAnalysis({ analysis, inView = true }: TextAnalysisProps) {
  if (!analysis.mostUsed || analysis.mostUsed.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="w-full rounded-xl bg-card border border-border/40 shadow-sm overflow-hidden"
    >
      {/* Header Section */}
      <div className="p-6 border-b border-border/40">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BsChatSquareText className="w-5 h-5 text-primary" />
          Textantworten-Analyse
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Häufigste Antworten und ihre Verteilung
        </p>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground px-3">
          <span>Antwort</span>
          <span>Häufigkeit</span>
        </div>

        <div className="space-y-2">
          {analysis.mostUsed.map(({ text, count }, index) => {
            const percentage = (count / analysis.totalResponses) * 100;
            return (
              <motion.div
                key={text}
                variants={item}
                className="group relative flex items-center justify-between p-4 rounded-lg bg-background border border-border/40 hover:border-primary/40 transition-all duration-200"
              >
                {/* Progress bar background */}
                <div
                  className="absolute left-0 top-0 h-full bg-primary/5 rounded-lg transition-all duration-200 group-hover:bg-primary/10"
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className="relative flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium truncate">{text}</span>
                </div>

                <div className="relative flex items-center gap-3 pl-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {count} Antworten
                    </span>
                  </div>
                  <BsGraphUp className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-6 py-4 bg-muted/5 border-t border-border/40">
        <p className="text-sm text-muted-foreground text-center">
          Basierend auf {analysis.totalResponses} Antworten
        </p>
      </div>
    </motion.div>
  );
}
