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
import { BsCalculator, BsGraphUp } from "react-icons/bs";

interface NumericalChartProps {
  data: {
    frequencies: Record<string, number>;
    total: number;
    average?: number;
    sortedValues?: Array<{ value: number; count: number }>;
  };
  inView?: boolean;
}

export function NumericalChart({
  data: analysis,
  inView = true,
}: NumericalChartProps) {
  if (!analysis || (!analysis.sortedValues && !analysis.frequencies)) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  // Create sortedValues from frequencies if not present
  const chartData =
    analysis.sortedValues ||
    Object.entries(analysis.frequencies)
      .map(([value, count]) => ({ value: Number(value), count }))
      .sort((a, b) => a.value - b.value);

  const data = chartData.map((item) => ({
    value: item.value,
    count: item.count,
    percentage: ((item.count / analysis.total) * 100).toFixed(1),
  }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const item = {
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
          <BsCalculator className="w-5 h-5 text-primary" />
          Numerische Verteilung
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Verteilung der numerischen Antworten
        </p>
      </div>

      {/* Chart Section */}
      <div className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.4}
              />
              <XAxis
                dataKey="value"
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
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border/40 shadow-md rounded-lg p-3">
                        <p className="text-sm font-medium mb-1">
                          Wert: {data.value}
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

        {/* Stats Section */}
        {analysis.average !== undefined && (
          <motion.div
            variants={item}
            className="mt-6 p-4 rounded-lg bg-muted/5 border border-border/40 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <BsGraphUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Durchschnittliche Antwort
              </span>
            </div>
            <span className="text-lg font-semibold">
              {analysis.average.toFixed(2)}
            </span>
          </motion.div>
        )}
      </div>

      {/* Footer Section */}
      <div className="px-6 py-4 bg-muted/5 border-t border-border/40">
        <p className="text-sm text-muted-foreground text-center">
          Basierend auf {analysis.total} Antworten
        </p>
      </div>
    </motion.div>
  );
}
