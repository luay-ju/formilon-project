import { FormQuestion } from "@/types/Form";

interface ShortTextQuestionProps {
  question: FormQuestion;
  isPreview?: boolean;

  type?: string;
}

export function ShortTextQuestion({
  question,
  isPreview = true,
  type,
}: ShortTextQuestionProps) {
  return (
    <input
      type={type || "text"}
      className="w-full px-3 py-2 border border-input rounded-md bg-background"
      placeholder={
        (question?.properties?.placeholder as string) || "Kurze Textantwort"
      }
      disabled={isPreview}
      required={question?.required}
    />
  );
}
