import { motion } from "framer-motion";
import { LuStar } from "react-icons/lu";
import { BsStarFill } from "react-icons/bs";
import { RatingAnalysis } from "@/types/analytics";
import { FormSubmission } from "@/types/Form";

interface RatingChartProps {
  data: RatingAnalysis;
  question: {
    properties?: {
      maxRating: number;
      ratingType: "star" | "number";
    };
  };
  submissions: FormSubmission[];
  inView?: boolean;
}

// Animation variants
const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function RatingChart({
  question,
  inView = true,
  submissions,
}: RatingChartProps) {
  try {
    const maxRating = question?.properties?.maxRating ?? 5;

    // Safely handle missing submissions
    if (!submissions || submissions.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Keine Bewertungsdaten verfügbar
        </div>
      );
    }

    // Calculate average from valid responses with error handling
    const validResponses = submissions
      .map((submission) => {
        try {
          return submission.answers.find(
            (answer) => answer.question.type === "rating"
          );
        } catch (error) {
          console.error("Error finding rating answer:", error);
          return null;
        }
      })
      .filter(
        (response): response is NonNullable<typeof response> =>
          response !== null && response !== undefined
      );

    const numericValues = validResponses
      .map((response) => {
        try {
          const value = Number(response.value);
          return !isNaN(value) && value >= 0 && value <= maxRating
            ? value
            : null;
        } catch (error) {
          console.error("Error converting rating to number:", error);
          return null;
        }
      })
      .filter((value): value is number => value !== null);

    const average =
      numericValues.length > 0
        ? numericValues.reduce((sum, value) => sum + value, 0) /
          numericValues.length
        : 0;

    const totalResponses = numericValues.length;

    // Skip rendering if no valid responses
    if (totalResponses === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Keine gültigen Bewertungen gefunden
        </div>
      );
    }

    return (
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeInVariants}
        transition={{ duration: 0.5 }}
        className="w-full rounded-xl bg-card border border-border/40 shadow-sm overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-6 border-b border-border/40">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BsStarFill className="w-5 h-5 text-primary" />
            Bewertungsverteilung
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Durchschnittliche Bewertung: {average.toFixed(1)}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Average Rating Display */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-4xl font-bold text-foreground">
              {average.toFixed(1)}
            </p>

            {/* Star Display */}
            <div className="flex gap-2">
              {Array.from({ length: maxRating }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <LuStar
                    className={`w-8 h-8 transition-colors ${
                      index + 1 <= Math.round(average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted fill-muted/10"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-6 py-4 bg-muted/5 border-t border-border/40">
          <p className="text-sm text-muted-foreground text-center">
            Basierend auf {totalResponses} Antworten
          </p>
        </div>
      </motion.div>
    );
  } catch (error) {
    console.error("Error rendering RatingChart:", error);
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Fehler beim Anzeigen der Bewertungen
      </div>
    );
  }
}
