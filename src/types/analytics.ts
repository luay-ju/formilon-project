export interface EmojiAnalysis {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  mostUsed: Array<{
    emoji: string;
    count: number;
  }>;
}

export interface RatingAnalysis {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  mostUsed: Array<{
    rating: number;
    count: number;
  }>;
}

export interface LinearScaleAnalysis {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  mostUsed: Array<{
    rating: number;
    count: number;
  }>;
}

export interface TextAnalysis {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  mostUsed: Array<{
    text: string;
    count: number;
  }>;
  wordFrequency?: Record<string, number>;
}

export interface CategoricalAnalysis {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  mostUsed: Array<{
    category: string;
    count: number;
  }>;
  mostCommon?: Array<{
    category: string;
    count: number;
  }>;
}

export interface NumericalAnalysis {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  frequencies: Record<string, number>;
  totalResponses: number;
  distribution?: Array<{
    range: string;
    count: number;
  }>;
}

export interface DateAnalysis {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  earliest: string;
  latest: string;
  mostCommon: string[];
  distribution?: Array<{
    range: string;
    count: number;
  }>;
}
