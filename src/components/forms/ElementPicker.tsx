import React from "react";
import { LuSearch, LuX } from "react-icons/lu";
import { FORM_ELEMENTS } from "@/lib/FormElements";
import { QuestionType } from "@/types/Form";

interface ElementPickerProps {
  onSelect: (type: QuestionType) => void;
  onClose: () => void;
}

export function ElementPicker({ onSelect, onClose }: ElementPickerProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredElements = FORM_ELEMENTS.filter(
    (element) =>
      element.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-6 space-y-4 bg-background rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="relative flex-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question types..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
            />
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/5"
            aria-label="Close question type picker"
          >
            <LuX />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto p-1">
          {filteredElements.map((element) => (
            <button
              key={element.id}
              onClick={() => onSelect(element.type as QuestionType)}
              className="flex flex-col items-start gap-1 p-4 rounded-lg border border-input bg-card hover:bg-muted/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {element.icon}
                <span className="font-medium">{element.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {element.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
