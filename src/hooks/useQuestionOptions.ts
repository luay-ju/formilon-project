import { FormQuestion } from "@/types/Form";

interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export function useQuestionOptions(
  question: FormQuestion,
  onQuestionUpdate: (updates: Partial<FormQuestion>) => void
) {
  const addOption = () => {
    const options = question.properties.options || [];
    const newOption: QuestionOption = {
      id: Math.random().toString(36).substr(2, 9),
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };

    onQuestionUpdate({
      properties: {
        ...question.properties,
        options: [...options, newOption],
      },
    });
  };

  const updateOption = (optionId: string, newLabel: string) => {
    onQuestionUpdate({
      properties: {
        ...question.properties,
        options: (question.properties.options || []).map((opt) =>
          opt.id === optionId
            ? {
                ...opt,
                label: newLabel,
                value: newLabel.toLowerCase().replace(/\s+/g, "_"),
              }
            : opt
        ),
      },
    });
  };

  const deleteOption = (optionId: string) => {
    const options = question.properties.options || [];
    if (options.length <= 1) return;

    onQuestionUpdate({
      properties: {
        ...question.properties,
        options: options.filter((opt) => opt.id !== optionId),
      },
    });
  };

  const moveOption = (optionId: string, direction: "up" | "down") => {
    const options = question.properties.options || [];
    const currentIndex = options.findIndex((opt) => opt.id === optionId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= options.length) return;

    const newOptions = [...options];
    [newOptions[currentIndex], newOptions[newIndex]] = [
      newOptions[newIndex],
      newOptions[currentIndex],
    ];

    onQuestionUpdate({
      properties: {
        ...question.properties,
        options: newOptions,
      },
    });
  };

  return {
    addOption,
    updateOption,
    deleteOption,
    moveOption,
  };
}
