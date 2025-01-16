import React from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  LuGripVertical,
  LuChevronDown,
  LuChevronUp,
  LuPlus,
  LuTrash2,
  LuSmile,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";
import type { FormQuestion } from "@/types/Form";
import { EmojiPicker } from "./EmojiPicker";
import { EmojiSelectorQuestion } from "@/components/forms/questions/EmojiSelectorQuestion";

interface QuestionCardProps {
  question: FormQuestion;
  isActive: boolean;
  index: number;
  onActivate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddQuestionBelow: () => void;
  onUpdateQuestion: (updates: Partial<FormQuestion>) => void;
  children: React.ReactNode;
}

export function QuestionCard({
  question,
  isActive,
  onActivate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddQuestionBelow,
  onUpdateQuestion,
  children,
}: QuestionCardProps) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [emojiButtonRect, setEmojiButtonRect] = React.useState<DOMRect | null>(
    null
  );
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);
  const [isPreview, setIsPreview] = React.useState(false);

  const handleEmojiButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = emojiButtonRef.current?.getBoundingClientRect() || null;
    setEmojiButtonRect(rect);
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className="relative group">
      {/* Question Block */}
      <motion.div
        layout
        onClick={onActivate}
        className={`
          relative rounded-lg
          bg-card
          border border-transparent
          ${
            isActive
              ? "ring-1 ring-primary/20 border-primary/30 bg-primary/5"
              : "hover:bg-muted/5"
          }
          transition-all duration-200
        `}
      >
        {/* Drag Handle */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity cursor-move">
          <LuGripVertical className="w-4 h-4 text-muted" />
        </div>

        {/* Content Container */}
        <div className="px-8 py-3 space-y-2">
          {/* Question Header */}
          <div className="flex items-start justify-between group/header">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={question.title}
                  onChange={(e) => onUpdateQuestion({ title: e.target.value })}
                  className="w-full text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted"
                  placeholder="Fragetitel"
                />
              </div>
              <input
                type="text"
                value={question.description || ""}
                onChange={(e) =>
                  onUpdateQuestion({ description: e.target.value })
                }
                className="w-full text-xs text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-0 mt-0.5 placeholder:text-muted"
                placeholder="Beschreibung hinzufügen"
              />
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreview(!isPreview);
                }}
                className={`
                  p-1 rounded transition-colors
                  ${
                    isPreview
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-muted/10 text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {isPreview ? (
                  <LuEye className="w-4 h-4" />
                ) : (
                  <LuEyeOff className="w-4 h-4" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                className="p-1 rounded hover:bg-muted/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LuChevronUp className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                className="p-1 rounded hover:bg-muted/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LuChevronDown className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <LuTrash2 className="w-4 h-4" />
              </motion.button>
              <motion.button
                ref={emojiButtonRef}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEmojiButtonClick}
                className="p-1 rounded hover:bg-muted/10 text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <LuSmile className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Question Content */}
          <div className="pt-1">{children}</div>
        </div>
      </motion.div>

      {/* Add Question Button */}
      <div className="absolute inset-x-0 -bottom-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddQuestionBelow();
          }}
          className="
            flex items-center gap-1 px-2 py-1 
            text-xs font-medium text-muted-foreground
            bg-card
            rounded-md shadow-sm
            border border-muted/50
            hover:border-muted hover:text-foreground
            transition-all duration-200
          "
        >
          <LuPlus className="w-3 h-3" />
          Block hinzufügen
        </motion.button>
      </div>

      {/* Emoji Picker Portal */}
      {showEmojiPicker &&
        emojiButtonRect &&
        createPortal(
          <div
            className="fixed"
            style={{
              top: emojiButtonRect.bottom + 8,
              left: emojiButtonRect.left,
            }}
          >
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                onUpdateQuestion({
                  title: question.title + emoji,
                });
                setShowEmojiPicker(false);
              }}
              onClickOutside={() => setShowEmojiPicker(false)}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
