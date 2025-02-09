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

// A simple color palette for the pie chart slices.
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
  // Uncomment or add more metrics as needed.
  // { key: "settlementBalance", label: "Settlement Balance" },
  // { key: "netBalance", label: "Net Balance" },
];

// This function transforms the raw data for a given metric.
// Each object contains the userName, an absolute value (for sizing the pie),
// and the actual value for display.
const transformShares = (shares, metricKey) =>
  shares.map((share) => ({
    userName:
      share.user && share.user.userName ? share.user.userName : share.userId,
    absValue: Math.abs(Number(share[metricKey] || 0)), // if needed, adapt as necessary
    actualValue: Number(share[metricKey] || 0),
  }));

// In many cases for expense shares, you might only have a single value per share.
// If your data is directly passed as an array of objects with keys corresponding to the metric,
// you might transform your data like this:
const transformData = (data, metricKey) =>
  data.map((item) => ({
    userName: item.userName,
    absValue: Math.abs(Number(item[metricKey])),
    actualValue: Number(item[metricKey]),
  }));

const PieCharts = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-10">
      {metrics.map((metric) => {
        // Transform the data for this metric.
        // Here we assume `data` is an array of objects where each object has a property for each metric.
        const chartData = transformData(data, metric.key);

        // Calculate the total absolute sum for this metric to decide if there is data to display.
        const totalMetric = chartData.reduce(
          (sum, item) => sum + item.absValue,
          0
        );

        return (
          <div key={metric.key} className="w-full h-64 my-10">
            <h3 className="text-lg font-bold mb-2 w-full flex justify-center">{metric.label}</h3>
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
                    // label={({ name, payload }) =>
                    //   `${name}: ${payload.actualValue}`
                    // }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) =>
                      `: ${props.payload.actualValue}`
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
