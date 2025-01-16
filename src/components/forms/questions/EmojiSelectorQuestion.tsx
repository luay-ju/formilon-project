import React from "react";
import { FormQuestion } from "@/types/Form";
import { LuPlus, LuTrash, LuGripVertical } from "react-icons/lu";
import { EmojiPicker } from "../EmojiPicker";
import { motion } from "framer-motion";

interface EmojiOption {
  id: string;
  emoji?: string;
  label: string;
  value: string;
}

interface EmojiSelectorQuestionProps {
  question: FormQuestion;
  isPreview?: boolean;
  onUpdateOptions?: (options: EmojiOption[]) => void;
}

export function EmojiSelectorQuestion({
  question,
  isPreview = false,
  onUpdateOptions,
}: EmojiSelectorQuestionProps) {
  const [activeEmojiPicker, setActiveEmojiPicker] = React.useState<
    string | null
  >(null);
  const options: EmojiOption[] = question.properties?.options || [];

  const handleAddOption = () => {
    const newOption: EmojiOption = {
      id: crypto.randomUUID(),
      emoji: "😊",
      label: "",
      value: `option_${options.length + 1}`,
    };
    onUpdateOptions?.([...options, newOption]);
  };

  const handleUpdateOption = (id: string, updates: Partial<EmojiOption>) => {
    onUpdateOptions?.(
      options.map((option) =>
        option.id === id ? { ...option, ...updates } : option
      )
    );
  };

  const handleDeleteOption = (id: string) => {
    onUpdateOptions?.(options.filter((option) => option.id !== id));
  };

  if (isPreview) {
    return (
      <div className="space-y-4">
        {/* Emoji Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-input bg-card hover:bg-muted/5 hover:border-border transition-all duration-200"
            >
              <span className="text-3xl transition-transform duration-200 hover:scale-110">
                {option.emoji}
              </span>
              <span className="text-sm text-muted-foreground text-center line-clamp-2">
                {option.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <motion.div
          key={option.id}
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/5"
        >
          {/* Drag Handle */}
          <button
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
            aria-label="Drag to reorder"
          >
            <LuGripVertical className="text-muted-foreground" size={16} />
          </button>

          {/* Emoji Button */}
          <button
            onClick={() => setActiveEmojiPicker(option.id)}
            className="w-12 h-12 text-2xl flex items-center justify-center bg-background border border-input rounded-lg hover:border-border transition-all duration-200"
          >
            {option.emoji}
          </button>

          {/* Label Input */}
          <input
            type="text"
            value={option.label}
            onChange={(e) =>
              handleUpdateOption(option.id, { label: e.target.value })
            }
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-input"
            placeholder={`Option ${index + 1} description`}
          />

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeleteOption(option.id)}
            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all duration-200"
            aria-label="Delete option"
          >
            <LuTrash size={16} />
          </motion.button>

          {/* Emoji Picker Portal */}
          {activeEmojiPicker === option.id && (
            <div className="absolute z-50">
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  handleUpdateOption(option.id, { emoji });
                  setActiveEmojiPicker(null);
                }}
                onClickOutside={() => setActiveEmojiPicker(null)}
              />
            </div>
          )}
        </motion.div>
      ))}

      {/* Add Option Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleAddOption}
        className="flex items-center gap-2 w-full p-3 text-sm text-muted-foreground bg-muted/5  rounded-lg border border-dashed border-muted hover:border-muted-foreground transition-all duration-200"
      >
        <LuPlus size={16} />
        Add emoji option
      </motion.button>
    </div>
  );
}
