export const QUESTION_TYPES = {
  short_text: "short_text",
  long_text: "long_text",
  multiple_choice: "multiple_choice",
  checkboxes: "checkboxes",
  dropdown: "dropdown",
  multi_select: "multi_select",
  number: "number",
  linear_scale: "linear_scale",
  date: "date",
  emoji_selector: "emoji_selector",
} as const;

interface QuestionAnalytics {
  frequencies: Record<string, number>;
  totalResponses: number;
  percentages: Record<string, number>;
  mostUsed: Array<{ text: string; count: number }>;
  average?: number;
  sortedValues?: Array<{ value: number; count: number }>;
}

interface EmojiOption {
  id: string;
  emoji: string;
  label: string;
}

interface QuestionProperties {
  options?: EmojiOption[];
}

export const processTextResponses = (
  responses: string[]
): QuestionAnalytics => {
  const frequencies: Record<string, number> = {};
  let total = 0;

  responses.forEach((response) => {
    frequencies[response] = (frequencies[response] || 0) + 1;
    total++;
  });

  const mostUsed = Object.entries(frequencies)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    frequencies,
    totalResponses: total,
    percentages: Object.entries(frequencies).reduce((acc, [text, count]) => {
      acc[text] = (count / total) * 100;
      return acc;
    }, {} as Record<string, number>),
    mostUsed,
  };
};

export const processCategoricalResponses = (
  responses: string[]
): QuestionAnalytics => {
  const frequencies: Record<string, number> = {};
  let total = 0;

  responses.forEach((response) => {
    frequencies[response] = (frequencies[response] || 0) + 1;
    total++;
  });

  const mostUsed = Object.entries(frequencies)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    frequencies,
    totalResponses: total,
    percentages: Object.entries(frequencies).reduce((acc, [text, count]) => {
      acc[text] = (count / total) * 100;
      return acc;
    }, {} as Record<string, number>),
    mostUsed,
  };
};

export const processDateResponses = (
  responses: string[]
): QuestionAnalytics => {
  const frequencies: Record<string, number> = {};
  let total = 0;

  const validDates = responses
    .map((r) => new Date(r))
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toISOString().split("T")[0]);

  validDates.forEach((date) => {
    frequencies[date] = (frequencies[date] || 0) + 1;
    total++;
  });

  const mostUsed = Object.entries(frequencies)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    frequencies,
    totalResponses: total,
    percentages: Object.entries(frequencies).reduce((acc, [text, count]) => {
      acc[text] = (count / total) * 100;
      return acc;
    }, {} as Record<string, number>),
    mostUsed,
  };
};

export const processEmojiResponses = (
  responses: string[],
  options?: EmojiOption[]
): QuestionAnalytics => {
  const frequencies: Record<string, number> = {};
  let total = 0;

  // Create a mapping of UUID to emoji
  const emojiMap =
    options?.reduce((acc, opt) => {
      acc[opt.id] = opt.emoji;
      return acc;
    }, {} as Record<string, string>) || {};

  // Process responses, converting UUIDs to emojis if possible
  responses.forEach((response) => {
    const emoji = emojiMap[response] || response;
    frequencies[emoji] = (frequencies[emoji] || 0) + 1;
    total++;
  });

  const mostUsed = Object.entries(frequencies)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    frequencies,
    totalResponses: total,
    percentages: Object.entries(frequencies).reduce((acc, [text, count]) => {
      acc[text] = (count / total) * 100;
      return acc;
    }, {} as Record<string, number>),
    mostUsed,
  };
};

export function processLinearScaleResponses(
  responses: string[]
): QuestionAnalytics {
  const frequencies: Record<string, number> = {};
  let total = 0;
  let sum = 0;

  responses.forEach((response) => {
    const value = Number(response);
    if (!isNaN(value)) {
      frequencies[response] = (frequencies[response] || 0) + 1;
      total++;
      sum += value;
    }
  });

  const average = total > 0 ? sum / total : 0;
  const sortedValues = Object.entries(frequencies)
    .map(([value, count]) => ({ value: Number(value), count }))
    .sort((a, b) => a.value - b.value);

  const mostUsed = Object.entries(frequencies)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    frequencies,
    totalResponses: total,
    percentages: Object.entries(frequencies).reduce((acc, [text, count]) => {
      acc[text] = (count / total) * 100;
      return acc;
    }, {} as Record<string, number>),
    mostUsed,
    average,
    sortedValues,
  };
}

export function processResponses(
  responses: string[],
  type: string,
  properties?: QuestionProperties
): QuestionAnalytics {
  switch (type) {
    case QUESTION_TYPES.multiple_choice:
    case QUESTION_TYPES.checkboxes:
    case QUESTION_TYPES.dropdown:
    case QUESTION_TYPES.multi_select:
      return processCategoricalResponses(responses);
    case QUESTION_TYPES.short_text:
    case QUESTION_TYPES.long_text:
      return processTextResponses(responses);
    case QUESTION_TYPES.number:
    case QUESTION_TYPES.linear_scale:
      return processLinearScaleResponses(responses);
    case QUESTION_TYPES.date:
      return processDateResponses(responses);
    case QUESTION_TYPES.emoji_selector:
      if (Array.isArray(properties?.options)) {
        return processEmojiResponses(responses, properties.options);
      }
      return {
        frequencies: {},
        totalResponses: 0,
        percentages: {},
        mostUsed: [],
      };
    default:
      return {
        frequencies: {},
        totalResponses: 0,
        percentages: {},
        mostUsed: [],
      };
  }
}
