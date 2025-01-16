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
  | "emoji_selector"
  | "date"
  | "ranking"
  | "email"
  | "phone"
  | "link";

export interface AnalyticsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  questionTypes?: QuestionType[];
  searchTerm?: string;
  valueRange?: {
    min: number;
    max: number;
  };
}

export interface TextAnalysis {
  wordFrequency: Record<string, number>;
  averageLength: number;
  responseCount: number;
  commonPhrases: Array<{ phrase: string; count: number }>;
}

export interface CategoricalAnalysis {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  mostCommon: { value: string; count: number };
  leastCommon: { value: string; count: number };
}

export interface NumericalAnalysis {
  mean: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  min: number;
  max: number;
  distribution: Array<{ value: number; count: number }>;
  totalResponses: number;
}

export interface DateAnalysis {
  distribution: Array<{ date: string; count: number }>;
  mostActiveDay: { date: string; count: number };
  leastActiveDay: { date: string; count: number };
  weekdayDistribution: Record<string, number>;
  monthDistribution: Record<string, number>;
}

export interface EmojiAnalysis {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  mostUsed: Array<{ emoji: string; count: number }>;
}

export type QuestionAnalysis = {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  responseCount: number;
  analysis:
    | TextAnalysis
    | CategoricalAnalysis
    | NumericalAnalysis
    | DateAnalysis
    | EmojiAnalysis;
};

export interface FormAnalytics {
  formId: string;
  totalSubmissions: number;
  completionRate: number;
  averageTimeToComplete: number;
  questions: QuestionAnalysis[];
  submissionTrend: Array<{ date: string; count: number }>;
  deviceBreakdown: Record<string, number>;
}
