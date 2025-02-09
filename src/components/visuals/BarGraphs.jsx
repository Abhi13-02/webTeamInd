import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const BarGraphs = ({ data }) => {
  // Define a color palette for the bars.
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#8dd1e1",
    "#a4de6c",
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item, index) => {
        // Convert each object's metrics into an array for the chart.
        const graphData = [
          { name: "Total Paid", value: item.totalPaid },
          { name: "Total Share", value: item.totalShare },
          { name: "Settlement Credit", value: item.settlementCredit },
          { name: "Settlement Debit", value: item.settlementDebit },
          { name: "Settlement Balance", value: item.settlementBalance },
          { name: "Net Balance", value: item.netBalance },
        ];

        return (
          <div
            key={index}
            className="w-full h-80 bg-white rounded shadow-md pb-5"
          >
            <h3 className="text-center text-xl font-semibold mb-4">
              {item.userName}
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={graphData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
               
                <Bar dataKey="value" name="Amount">
                  {graphData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={colors[idx % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
};

export default BarGraphs;
