"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ExpensesGraph = () => {
  const { groupID } = useParams();
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch aggregated expense data when groupID or period changes.
  useEffect(() => {
    if (!groupID) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/group/${groupID}/expensesAggregate?period=${period}`);
        if (!res.ok) {
          throw new Error("Failed to fetch aggregated expenses");
        }
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error("Error fetching data");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupID, period]);

  // Extract distinct member names from the data.
  const memberNames = new Set();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== "period") {
        memberNames.add(key);
      }
    });
  });
  const memberNamesArray = Array.from(memberNames);

  // Define a color palette for the lines.
  const colors = [
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Expense Overview</h1>
      <div className="mb-4">
        <label htmlFor="period" className="mr-2 font-medium">
          Group By:
        </label>
        <select
          id="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="year">Year</option>
        </select>
      </div>
      {loading ? (
        <p>Loading data...</p>
      ) : data.length === 0 ? (
        <p>No expense data found.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            {memberNamesArray.map((member, index) => (
              <Line
                key={member}
                type="monotone"
                dataKey={member}
                stroke={colors[index % colors.length]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ExpensesGraph;
