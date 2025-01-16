import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import {
  LuLoader,
  LuChevronDown,
  LuChartLine,
  LuCalendar,
  LuSmile,
  LuMessageSquare,
} from "react-icons/lu";
import { useResultsAnalytics } from "@/hooks/useResultsAnalytics";
import { TextAnalysis } from "@/components/results/visualizations/TextAnalysis";
import { CategoricalChart } from "@/components/results/visualizations/CategoricalChart";
import { NumericalChart } from "@/components/results/visualizations/NumericalChart";
import { EmojiGrid } from "@/components/results/visualizations/EmojiGrid";
import { Form, FormSubmission, QuestionType } from "@/types/Form";
import {
  TextAnalysis as TextAnalysisType,
  CategoricalAnalysis,
  NumericalAnalysis,
  DateAnalysis,
  EmojiAnalysis,
  RatingAnalysis,
} from "@/types/analytics";
import { RatingChart } from "@/components/results/visualizations/RatingChart";

interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  responseCount: number;
  analysis:
    | TextAnalysisType
    | CategoricalAnalysis
    | NumericalAnalysis
    | DateAnalysis
    | EmojiAnalysis
    | RatingAnalysis;
}

interface QuestionCardProps {
  question: QuestionAnalytics;
  submissions: FormSubmission[];
}

const getQuestionIcon = (type: QuestionType) => {
  switch (type) {
    case "short_text":
    case "long_text":
      return <LuMessageSquare className="w-6 h-6" />;
    case "multiple_choice":
    case "checkboxes":
    case "dropdown":
    case "multi_select":
    case "number":
    case "linear_scale":
    case "rating":
      return <LuChartLine className="w-6 h-6" />;
    case "date":
      return <LuCalendar className="w-6 h-6" />;
    case "emoji_selector":
      return <LuSmile className="w-6 h-6" />;
    default:
      return <LuMessageSquare className="w-6 h-6" />;
  }
};

const QuestionCard = ({ question, submissions }: QuestionCardProps) => {
  const [ref, cardInView] = useInView({
    threshold: 0.2,
    triggerOnce: false,
    rootMargin: "-10% 0px -10% 0px",
  });

  // Skip rendering for sensitive data types
  const sensitiveTypes = ["email", "phone", "date"];
  if (sensitiveTypes.includes(question.questionType)) {
    return null;
  }

  const getVisualization = () => {
    try {
      if (!question.analysis) {
        console.log("Missing analysis data for question:", question);
        return null;
      }

      switch (question.questionType) {
        case "short_text":
        case "long_text":
          return (
            <TextAnalysis
              analysis={question.analysis as TextAnalysisType}
              inView={cardInView}
            />
          );
        case "multiple_choice":
        case "checkboxes":
        case "dropdown":
        case "multi_select":
          return (
            <CategoricalChart
              data={question.analysis as CategoricalAnalysis}
              inView={cardInView}
            />
          );
        case "number":
          return (
            <NumericalChart
              data={{
                ...(question.analysis as NumericalAnalysis),
                total: submissions?.length || 0,
              }}
              inView={cardInView}
            />
          );
        case "emoji_selector":
          return (
            <EmojiGrid
              data={question.analysis as EmojiAnalysis}
              title={question.questionTitle}
            />
          );
        case "rating":
          return (
            <RatingChart
              data={question.analysis as RatingAnalysis}
              submissions={submissions || []}
              question={{
                properties: {
                  maxRating: 5,
                  ratingType: "star",
                },
              }}
              inView={cardInView}
            />
          );
        case "linear_scale":
          return (
            <NumericalChart
              data={{
                ...(question.analysis as NumericalAnalysis),
                total: submissions?.length || 0,
              }}
              inView={cardInView}
            />
          );
        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering visualization:", error);
      return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={
        cardInView
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
            }
          : {
              opacity: 0,
              y: 100,
              scale: 0.95,
              rotateX: 10,
            }
      }
      transition={{
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1,
        opacity: { duration: 0.4 },
      }}
      className="w-full min-h-screen flex flex-col items-center justify-center p-6 snap-center will-change-transform"
    >
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={
            cardInView
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }
              : {
                  opacity: 0,
                  y: 20,
                  scale: 0.95,
                }
          }
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex items-center gap-3 mb-6 backdrop-blur-sm bg-background/50 p-4 rounded-lg border border-border/50"
        >
          <motion.div
            animate={
              cardInView
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: "easeOut",
            }}
          >
            {getQuestionIcon(question.questionType)}
          </motion.div>
          <h3 className="text-2xl font-semibold text-foreground">
            {question.questionTitle}
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={
            cardInView
              ? {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  rotateX: 0,
                }
              : {
                  opacity: 0,
                  scale: 0.95,
                  y: 30,
                  rotateX: 5,
                }
          }
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.3,
          }}
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
          className="bg-card rounded-xl shadow-lg border border-border overflow-hidden backdrop-blur-sm"
        >
          {getVisualization()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function ResultsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[] | null>(null);
  const [filters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);

  const analytics = useResultsAnalytics(form, submissions, filters);

  // Filter out sensitive data types
  const filteredAnalytics = analytics.filter((question) => {
    const sensitiveTypes = ["email", "phone", "date"];
    return !sensitiveTypes.includes(question.questionType);
  });

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress(currentScroll / totalScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [formRes, submissionsRes] = await Promise.all([
          fetch(`/api/forms/${id}`),
          fetch(`/api/forms/${id}/submissions`),
        ]);

        if (!formRes.ok || !submissionsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [formData, submissionsData] = await Promise.all([
          formRes.json(),
          submissionsRes.json(),
        ]);

        // Validate data before setting state
        if (!formData || !submissionsData) {
          throw new Error("Invalid data received from API");
        }

        setForm(formData);
        setSubmissions(submissionsData);
        setIsDataReady(true);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  // Add data validation before rendering
  if (!isDataReady && !loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <LuLoader className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-foreground">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => router.push("/forms")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Forms
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background snap-y snap-mandatory perspective-1000">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
        style={{
          scaleX: scrollProgress,
          transformOrigin: "left",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress }}
        transition={{
          duration: 0.1,
          ease: "linear",
        }}
      />

      {/* Hero section */}
      <div className="min-h-screen flex flex-col items-center justify-center relative px-4 snap-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2,
          }}
          className="text-center max-w-4xl relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight"
          >
            Form Results
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-xl text-muted-foreground mb-12"
          >
            Analyzing {submissions?.length || 0} submissions
          </motion.p>
          <motion.button
            onClick={scrollToNext}
            className="text-muted-foreground hover:text-foreground transition-colors relative"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.1 }}
          >
            <LuChevronDown className="w-8 h-8" />
            <motion.div
              className="absolute -inset-4 bg-primary/5 rounded-full z-[-1]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.button>
        </motion.div>

        {/* Background decoration */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent" />
          <div className="absolute inset-0 bg-grid-primary/5 bg-[size:20px_20px]" />
        </motion.div>
      </div>

      {/* Results section */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {filteredAnalytics.map((question) => (
            <QuestionCard
              key={question.questionId}
              question={question}
              submissions={submissions || []}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
