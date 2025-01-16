export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "multi_select"
  | "number"
  | "linear_scale"
  | "rating"
  | "date"
  | "email"
  | "phone"
  | "emoji_selector";

export interface FormSubmission {
  id: string;
  completed: boolean;
  metadata: {
    timestamp: string;
    userAgent: string;
  };
  formId: string;
  createdAt: string;
  updatedAt: string;
  answers: Array<{
    id: string;
    value: string;
    questionId: string;
    submissionId: string;
    createdAt: string;
    question: {
      id: string;
      title: string;
      type: QuestionType;
    };
  }>;
}

interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface FormQuestion {
  id: string;
  title: string;
  description?: string | null;
  required: boolean;
  order: number;
  properties: {
    options?: QuestionOption[];
    [key: string]: unknown;
  };
  logic?: Record<string, unknown>;
}

export interface Question {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  required: boolean;
  order: number;
  properties: Record<string, unknown>;
  logic?: Record<string, unknown>;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  responses?: number;
  translations?: FormTranslations;
  welcomeScreen?: {
    title: string;
    description?: string;
    buttonText: string;
  } | null;
  thankyouScreen?: {
    title: string;
    description?: string;
  } | null;
  questions: Array<{
    id: string;
    title: string;
    description: string | null;
    properties?: {
      options?: Array<{
        id: string;
        label: string;
        value: string;
        emoji?: string;
      }>;
      maxEmoji?: string;
      maxLabel?: string;
      maxValue?: number;
      minEmoji?: string;
      minLabel?: string;
      minValue?: number;
      maxRating?: number;
      ratingType?: string;
    };
  }>;
  _count?: {
    submissions: number;
  };
}

export interface Translation {
  title: string;
  description: string | null;
  questions: Array<{
    id: string;
    title: string;
    description: string | null;
    properties?: {
      options?: Array<{
        id: string;
        label: string;
        value: string;
        emoji?: string;
      }>;
      maxEmoji?: string;
      maxLabel?: string;
      maxValue?: number;
      minEmoji?: string;
      minLabel?: string;
      minValue?: number;
      maxRating?: number;
      ratingType?: string;
    };
  }>;
  welcomeScreen: {
    title: string;
    description?: string;
    buttonText: string;
  } | null;
  thankyouScreen: {
    title: string;
    description?: string;
  } | null;
}

export interface FormTranslations {
  [key: string]: Translation;
}
