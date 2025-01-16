import { FormQuestion } from "@/types/Form";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState } from "react";
import { EmojiPicker } from "@/components/forms/EmojiPicker";

interface LinearScaleQuestionProps {
  question: FormQuestion;
  isPreview?: boolean;
  onUpdateProperties?: (updates: Partial<LinearScaleProperties>) => void;
  onChange?: (value: number) => void;
  value?: number;
}

interface LinearScaleProperties {
  minValue: number;
  maxValue: number;
  minLabel?: string;
  maxLabel?: string;
  minEmoji?: string;
  maxEmoji?: string;
  colorStart?: string;
  colorEnd?: string;
}

const DEFAULT_EMOJIS = {
  min: "😔",
  mid: "😐",
  max: "🤩",
};

const DEFAULT_COLORS = {
  start: "rgb(239, 68, 68)", // red-500
  mid: "rgb(234, 179, 8)", // yellow-500
  end: "rgb(34, 197, 94)", // green-500
};

export function LinearScaleQuestion({
  question,
  isPreview = false,
  onUpdateProperties,
  onChange,
  value: externalValue,
}: LinearScaleQuestionProps) {
  const properties = question.properties as unknown as LinearScaleProperties;
  const minValue = properties.minValue ?? 1;
  const maxValue = properties.maxValue ?? 5;
  const minLabel = properties.minLabel ?? "";
  const maxLabel = properties.maxLabel ?? "";
  const minEmoji = properties.minEmoji ?? DEFAULT_EMOJIS.min;
  const maxEmoji = properties.maxEmoji ?? DEFAULT_EMOJIS.max;
  const colorStart = properties.colorStart ?? DEFAULT_COLORS.start;
  const colorEnd = properties.colorEnd ?? DEFAULT_COLORS.end;

  const [selectedValue, setSelectedValue] = React.useState<number | null>(
    externalValue ?? null
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [showMinEmojiPicker, setShowMinEmojiPicker] = useState(false);
  const [showMaxEmojiPicker, setShowMaxEmojiPicker] = useState(false);

  // Update internal state when external value changes
  React.useEffect(() => {
    if (externalValue !== undefined) {
      setSelectedValue(externalValue);
    }
  }, [externalValue]);

  const scaleValues = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => i + minValue
  );

  const getProgressEmoji = (value: number) => {
    if (!value) return minEmoji;
    const progress = (value - minValue) / (maxValue - minValue);
    if (progress <= 0.25) return minEmoji;
    if (progress <= 0.75) return DEFAULT_EMOJIS.mid;
    return maxEmoji;
  };

  const getProgressColor = (value: number) => {
    if (!value) return colorStart;
    const progress = (value - minValue) / (maxValue - minValue);
    return `rgb(
      ${Math.round(
        parseInt(colorStart.split("(")[1].split(",")[0]) * (1 - progress) +
          parseInt(colorEnd.split("(")[1].split(",")[0]) * progress
      )},
      ${Math.round(
        parseInt(colorStart.split("(")[1].split(",")[1]) * (1 - progress) +
          parseInt(colorEnd.split("(")[1].split(",")[1]) * progress
      )},
      ${Math.round(
        parseInt(colorStart.split("(")[1].split(",")[2].split(")")[0]) *
          (1 - progress) +
          parseInt(colorEnd.split("(")[1].split(",")[2].split(")")[0]) *
            progress
      )}
    )`;
  };

  const handleValueSelect = (value: number) => {
    setSelectedValue(value);
    onChange?.(value);
  };

  return (
    <div className="space-y-6">
      {/* Labels and Emojis */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setShowMinEmojiPicker(true)}
            className="text-4xl transition-transform hover:scale-110 duration-200"
            aria-label="Minimales Emoji auswählen"
          >
            {minEmoji}
          </button>
          {minLabel && (
            <span className="text-muted-foreground">{minLabel}</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setShowMaxEmojiPicker(true)}
            className="text-4xl transition-transform hover:scale-110 duration-200"
            aria-label="Maximales Emoji auswählen"
          >
            {maxEmoji}
          </button>
          {maxLabel && (
            <span className="text-muted-foreground">{maxLabel}</span>
          )}
        </div>
      </div>

      {/* Scale */}
      <div className="relative py-12" ref={constraintsRef}>
        {/* Track Background */}
        <div
          className="absolute top-1/2 left-0 right-0 h-3 -translate-y-1/2 rounded-full overflow-hidden"
          style={{
            background: `linear-gradient(to right, ${colorStart}, ${colorEnd})`,
            opacity: 0.2,
          }}
          aria-label="Bewertungsskala Hintergrund"
        />

        {/* Active Track */}
        <div
          className="absolute top-1/2 left-0 h-3 -translate-y-1/2 rounded-full overflow-hidden transition-all duration-300"
          style={{
            width: selectedValue
              ? `${((selectedValue - minValue) / (maxValue - minValue)) * 100}%`
              : "0%",
            background: `linear-gradient(to right, ${colorStart}, ${getProgressColor(
              selectedValue || minValue
            )})`,
          }}
          aria-label="Aktiver Bewertungsbereich"
        />

        {/* Scale Points */}
        <div className="relative flex justify-between items-center">
          {scaleValues.map((value) => (
            <div
              key={value}
              className="relative group"
              onClick={() => handleValueSelect(value)}
            >
              <AnimatePresence>
                {selectedValue === value && (
                  <motion.div
                    className="absolute -inset-6 rounded-full"
                    style={{
                      background: getProgressColor(value),
                      opacity: 0.15,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  />
                )}
              </AnimatePresence>
              <div className="flex flex-col items-center gap-2">
                <motion.span
                  className="text-2xl cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    transform:
                      selectedValue === value ? "scale(1.2)" : "scale(1)",
                  }}
                  role="button"
                  aria-label={`Bewertung: ${value}`}
                >
                  {getProgressEmoji(value)}
                </motion.span>
                <span
                  className={`text-sm font-medium transition-colors duration-200 ${
                    selectedValue === value
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Draggable Handle */}
        {selectedValue !== null && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `calc(${
                ((selectedValue - minValue) / (maxValue - minValue)) * 100
              }% - 1.25rem)`,
            }}
            animate={{
              x: isDragging ? 2 : 0,
              scale: isDragging ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              drag="x"
              dragConstraints={constraintsRef}
              dragElastic={0}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onDrag={(_, info) => {
                if (!constraintsRef.current) return;
                const bounds = constraintsRef.current.getBoundingClientRect();
                const percent = Math.max(
                  0,
                  Math.min(1, (info.point.x - bounds.left) / bounds.width)
                );
                const value = Math.round(
                  minValue + percent * (maxValue - minValue)
                );
                handleValueSelect(value);
              }}
              className="relative w-10 h-10 rounded-full shadow-lg cursor-grab active:cursor-grabbing"
              style={{
                background: getProgressColor(selectedValue),
              }}
            >
              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: getProgressColor(selectedValue),
                    }}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </AnimatePresence>
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <span className="text-lg">
                  {getProgressEmoji(selectedValue)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Editor Controls (only shown when not in preview) */}
      {!isPreview && onUpdateProperties && (
        <div className="space-y-4 pt-6 border-t">
          <div className="grid grid-cols-2 gap-4">
            {/* Min/Max Value Controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum value</label>
              <input
                type="number"
                value={minValue}
                onChange={(e) =>
                  onUpdateProperties({
                    minValue: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
                min={0}
                max={maxValue - 1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum value</label>
              <input
                type="number"
                value={maxValue}
                onChange={(e) =>
                  onUpdateProperties({
                    maxValue: Math.max(
                      minValue + 1,
                      parseInt(e.target.value) || minValue + 1
                    ),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
                min={minValue + 1}
                max={10}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Minimum label (optional)
              </label>
              <input
                type="text"
                value={minLabel}
                onChange={(e) =>
                  onUpdateProperties({ minLabel: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Not at all likely"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Maximum label (optional)
              </label>
              <input
                type="text"
                value={maxLabel}
                onChange={(e) =>
                  onUpdateProperties({ maxLabel: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Extremely likely"
              />
            </div>
          </div>

          {/* Add Emoji Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Emoji</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMinEmojiPicker(true)}
                  className="w-full px-3 py-2 border rounded-lg text-2xl text-center hover:bg-muted/50 transition-colors"
                >
                  {minEmoji}
                </button>
                {showMinEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 z-50">
                    <EmojiPicker
                      onEmojiSelect={(emoji) => {
                        onUpdateProperties({ minEmoji: emoji });
                        setShowMinEmojiPicker(false);
                      }}
                      onClickOutside={() => setShowMinEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Emoji</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMaxEmojiPicker(true)}
                  className="w-full px-3 py-2 border rounded-lg text-2xl text-center hover:bg-muted/50 transition-colors"
                >
                  {maxEmoji}
                </button>
                {showMaxEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 z-50">
                    <EmojiPicker
                      onEmojiSelect={(emoji) => {
                        onUpdateProperties({ maxEmoji: emoji });
                        setShowMaxEmojiPicker(false);
                      }}
                      onClickOutside={() => setShowMaxEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
