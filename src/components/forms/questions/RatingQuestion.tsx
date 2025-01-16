import { FormQuestion } from "@/types/Form";
import { LuMinus, LuPlus, LuStar } from "react-icons/lu";
import { motion } from "framer-motion";

interface RatingQuestionProps {
  question: FormQuestion;
  isPreview?: boolean;
  onUpdateProperties?: (updates: Partial<RatingProperties>) => void;
}

interface RatingProperties {
  maxRating: number;
  ratingType: "star" | "number";
}

export function RatingQuestion({
  question,
  isPreview = false,
  onUpdateProperties,
}: RatingQuestionProps) {
  const properties = question.properties as unknown as RatingProperties;
  const maxRating = properties.maxRating ?? 5;
  const ratingType = properties.ratingType ?? "star";

  const ratingValues = Array.from({ length: maxRating }, (_, i) => i + 1);

  if (isPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {ratingValues.map((value) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.1 }}
              className={`
                transition-colors duration-200
                ${
                  ratingType === "star"
                    ? "text-2xl text-muted hover:text-yellow-400"
                    : "w-10 h-10 rounded-full bg-muted/5 border border-input hover:bg-muted/10 flex items-center justify-center text-muted-foreground"
                }
              `}
            >
              {ratingType === "star" ? (
                <LuStar className="fill-current" />
              ) : (
                value
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Bewertungstyp</label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateProperties?.({ ratingType: "star" })}
            className={`
              flex-1 px-4 py-2 rounded-lg border transition-colors
              ${
                ratingType === "star"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-input hover:border-muted-foreground"
              }
            `}
          >
            <LuStar className="inline-block mr-2" />
            Sterne
          </button>
          <button
            onClick={() => onUpdateProperties?.({ ratingType: "number" })}
            className={`
              flex-1 px-4 py-2 rounded-lg border transition-colors
              ${
                ratingType === "number"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-input hover:border-muted-foreground"
              }
            `}
          >
            Zahlen
          </button>
        </div>
      </div>

      {/* Max Rating Control */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Maximale Bewertung</label>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onUpdateProperties?.({
                maxRating: Math.max(1, maxRating - 1),
              })
            }
            className="p-2 rounded-lg border border-input hover:bg-muted/5"
            disabled={maxRating <= 1}
            aria-label="Maximale Bewertung verringern"
          >
            <LuMinus size={16} />
          </motion.button>
          <input
            type="number"
            value={maxRating}
            onChange={(e) =>
              onUpdateProperties?.({
                maxRating: Math.max(
                  1,
                  Math.min(10, parseInt(e.target.value) || 1)
                ),
              })
            }
            className="w-20 px-3 py-2 text-center border border-input rounded-lg"
            min={1}
            max={10}
            aria-label="Maximaler Bewertungswert"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onUpdateProperties?.({
                maxRating: Math.min(10, maxRating + 1),
              })
            }
            className="p-2 rounded-lg border border-input hover:bg-muted/5"
            disabled={maxRating >= 10}
            aria-label="Maximale Bewertung erhöhen"
          >
            <LuPlus size={16} />
          </motion.button>
        </div>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t">
        <span className="text-sm font-medium text-muted-foreground">
          Vorschau
        </span>
        <div className="mt-4">
          <RatingQuestion question={question} isPreview={true} />
        </div>
      </div>
    </div>
  );
}
