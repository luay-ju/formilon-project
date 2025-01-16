import { FormQuestion } from "@/types/Form";
import {
  LuChevronDown,
  LuChevronUp,
  LuGripVertical,
  LuPlus,
  LuTrash,
} from "react-icons/lu";

interface MultipleChoiceQuestionProps {
  question: FormQuestion;
  isPreview?: boolean;
  onUpdateOption?: (optionId: string, newLabel: string) => void;
  onAddOption?: () => void;
  onDeleteOption?: (optionId: string) => void;
  onMoveOption?: (optionId: string, direction: "up" | "down") => void;
}

export function MultipleChoiceQuestion({
  question,
  isPreview = true,
  onUpdateOption,
  onAddOption,
  onDeleteOption,
  onMoveOption,
}: MultipleChoiceQuestionProps) {
  const options = question.properties.options || [];

  if (isPreview) {
    return (
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <input
              type="radio"
              disabled
              aria-label={`Option: ${option.label}`}
            />
            <span className="text-muted-foreground">{option.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {options.map((option, i) => (
        <div key={option.id} className="flex items-center gap-2 group">
          <div className="flex items-center gap-2 flex-1">
            <button
              className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <LuGripVertical className="text-muted-foreground" size={16} />
            </button>
            <input
              type="radio"
              disabled
              aria-label={`Option: ${option.label}`}
            />
            <input
              type="text"
              value={option.label}
              onChange={(e) => onUpdateOption?.(option.id, e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1"
              placeholder="Optionstext"
            />
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <button
              onClick={() => onMoveOption?.(option.id, "up")}
              className="p-1 text-muted-foreground hover:text-foreground"
              disabled={i === 0}
              aria-label="Nach oben verschieben"
            >
              <LuChevronUp size={16} />
            </button>
            <button
              onClick={() => onMoveOption?.(option.id, "down")}
              className="p-1 text-muted-foreground hover:text-foreground"
              disabled={i === options.length - 1}
              aria-label="Nach unten verschieben"
            >
              <LuChevronDown size={16} />
            </button>
            <button
              onClick={() => onDeleteOption?.(option.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
              disabled={options.length <= 1}
              aria-label="Option löschen"
            >
              <LuTrash size={16} />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={onAddOption}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <LuPlus size={16} />
        Option hinzufügen
      </button>
    </div>
  );
}
