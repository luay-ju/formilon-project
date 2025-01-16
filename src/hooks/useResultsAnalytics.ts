import { useMemo } from "react";
import { QuestionType, FormSubmission, Form } from "../types/Form";
import { processResponses } from "../utils/dataTransformers";
import {
  TextAnalysis,
  CategoricalAnalysis,
  NumericalAnalysis,
  DateAnalysis,
  EmojiAnalysis,
  RatingAnalysis,
  LinearScaleAnalysis,
} from "../types/analytics";

interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  responseCount: number;
  analysis:
    | TextAnalysis
    | CategoricalAnalysis
    | NumericalAnalysis
    | DateAnalysis
    | EmojiAnalysis
    | RatingAnalysis
    | LinearScaleAnalysis;
}

interface QuestionProperties {
  options?: {
    id: string;
    label: string;
    value: string;
    emoji: string;
  }[];
}

interface Question {
  id: string;
  title: string;
  description: string | null;
  type: QuestionType;
  properties?: QuestionProperties;
}

export const useResultsAnalytics = (
  form: Form | null,
  submissions: FormSubmission[] | null,
  filters: Record<string, string[]>
): QuestionAnalytics[] => {
  return useMemo(() => {
    try {
      if (!form || !submissions) {
        console.log("Missing form or submissions data", { form, submissions });
        return [];
      }

      const validSubmissions = submissions.filter(
        (submission) => submission?.answers && submission.answers.length > 0
      );

      return (form.questions as Question[]).map((question) => {
        try {
          const answers = validSubmissions
            .map((submission) =>
              submission.answers.find(
                (answer) => answer.questionId === question.id
              )
            )
            .filter((answer): answer is NonNullable<typeof answer> => !!answer)
            .filter((answer) => {
              try {
                // Apply filters
                return Object.entries(filters).every(
                  ([filterId, allowedValues]) => {
                    if (allowedValues.length === 0) return true;
                    const filterAnswer = validSubmissions
                      .find((s) => s.id === answer.submissionId)
                      ?.answers.find((a) => a.questionId === filterId);
                    return (
                      filterAnswer && allowedValues.includes(filterAnswer.value)
                    );
                  }
                );
              } catch (error) {
                console.error("Error applying filters:", error);
                return true; // Skip filtering on error
              }
            })
            .map((answer) => answer.value);

          // Cast the answers array to string[] for processResponses
          const processedAnswers = answers.map((val) =>
            typeof val === "number" ? String(val) : val
          ) as string[];

          return {
            questionId: question.id,
            questionTitle: question.title,
            questionType: question.type,
            responseCount: answers.length,
            analysis: processResponses(
              processedAnswers,
              question.type,
              question.properties
            ),
          };
        } catch (error) {
          console.error("Error processing question:", question.id, error);
          return {
            questionId: question.id,
            questionTitle: question.title || "Untitled Question",
            questionType: question.type,
            responseCount: 0,
            analysis: {} as any, // Fallback empty analysis
          };
        }
      });
    } catch (error) {
      console.error("Error in useResultsAnalytics:", error);
      return [];
    }
  }, [form, submissions, filters]);
};
