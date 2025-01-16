import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CategoricalAnalysis } from "@/types/analytics";
import { BsBarChartLine } from "react-icons/bs";

interface CategoricalChartProps {
  data: CategoricalAnalysis;
  inView?: boolean;
}

interface ChartDataItem {
  category: string;
  count: number;
  percentage: string;
}

export const CategoricalChart = ({
  data,
  inView = true,
}: CategoricalChartProps) => {
  // Add error handling for missing data
  if (!data || !data.percentages || !data.frequencies || !data.totalResponses) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  const chartData: ChartDataItem[] = Object.entries(data.percentages).map(
    ([category, percentage]) => {
      try {
        return {
          category,
          count: data.frequencies[category] || 0,
          percentage: (percentage || 0).toFixed(1),
        };
      } catch (error) {
        console.error("Error processing category data:", error);
        return {
          category,
          count: 0,
          percentage: "0.0",
        };
      }
    }
  );

  // Skip rendering if no valid data
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Keine Kategorien verfügbar
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="w-full rounded-xl bg-card border border-border/40 shadow-sm overflow-hidden"
    >
      {/* Header Section */}
      <div className="p-6 border-b border-border/40">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BsBarChartLine className="w-5 h-5 text-primary" />
          Kategorieverteilung
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Verteilung der Antworten nach Kategorie
        </p>
      </div>

      {/* Chart Section */}
      <div className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.4}
              />
              <XAxis
                dataKey="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={8}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={8}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataItem;
                    return (
                      <div className="bg-popover border border-border/40 shadow-md rounded-lg p-3">
                        <p className="text-sm font-medium mb-1">
                          {data.category}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} Antworten ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
                className="hover:opacity-100 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Categories List */}
        <div className="mt-6 space-y-2">
          {chartData.map((item, index) => (
            <motion.div
              key={item.category}
              variants={itemAnimation}
              className="group relative flex items-center justify-between p-4 rounded-lg bg-background border border-border/40 hover:border-primary/40 transition-all duration-200"
            >
              {/* Progress bar background */}
              <div
                className="absolute left-0 top-0 h-full bg-primary/5 rounded-lg transition-all duration-200 group-hover:bg-primary/10"
                style={{ width: `${item.percentage}%` }}
              />

              {/* Content */}
              <div className="relative flex items-center gap-3 flex-1 min-w-0">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-sm font-medium truncate">
                  {item.category}
                </span>
              </div>

              <div className="relative flex items-center gap-3 pl-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">
                    {item.percentage}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.count} Antworten
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-6 py-4 bg-muted/5 border-t border-border/40">
        <p className="text-sm text-muted-foreground text-center">
          Basierend auf {data.totalResponses} Antworten
        </p>
      </div>
    </motion.div>
  );
};
