import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { format } from "date-fns";

// Define a color palette for the slices.
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
];

// Define the metrics we want to display, each with a label.
const metrics = [
  { key: "totalPaid", label: "Total Paid" },
  { key: "totalShare", label: "Total Share" },
  { key: "settlementCredit", label: "Settlement Credit" },
  { key: "settlementDebit", label: "Settlement Debit" },
//   { key: "settlementBalance", label: "Settlement Balance" },
//   { key: "netBalance", label: "Net Balance" },
];

// Custom tooltip component that displays the original (actual) value.
const CustomTooltip = ({ active, payload, label, metricLabel }) => {
  if (active && payload && payload.length) {
    const { actualValue } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 p-2 shadow">
        <p>{`${label} : ${actualValue}`}</p>
        <p className="text-xs text-gray-500">{metricLabel}</p>
      </div>
    );
  }
  return null;
};

const PieCharts = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-10">
      {metrics.map((metric) => {
        // Prepare chartData: each item contains userName, an absolute value for chart sizing, and the original value.
        const chartData = data.map((item) => ({
          userName: item.userName,
          absValue: Math.abs(item[metric.key]),
          actualValue: item[metric.key],
        }));

        // Calculate total metric value (absolute sum) to check if any data exists.
        const totalMetric = chartData.reduce((sum, item) => sum + item.absValue, 0);

        return (
          <div key={metric.key} className="w-full h-64">
            <h3 className="text-lg font-bold mb-2">{metric.label}</h3>
            {totalMetric === 0 ? (
              <p className="text-center text-gray-500">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="absValue"
                    nameKey="userName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, payload }) =>
                      `${name}: ${payload.actualValue}`
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <CustomTooltip metricLabel={metric.label} />
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PieCharts;
