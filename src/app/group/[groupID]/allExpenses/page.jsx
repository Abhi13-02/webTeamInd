"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

// A simple color palette for the pie chart slices.
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

// Transform the expense.shares array into an array of objects with userName and share.
// If share.user is not available, fallback to using share.userId.
const transformShares = (shares) =>
  shares?.map((share) => ({
    userName: share?.user?.userName || share?.userId || "Unknown",
    share: Number(share?.share) || 0,
  })) || [];

const BalancesPage = () => {
  const { groupID } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExpenses, setExpandedExpenses] = useState([]);

  useEffect(() => {
    if (!groupID) return;
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`/api/group/${groupID}/expenses`);
        if (!res?.ok) {
          throw new Error("Failed to fetch expenses");
        }
        const data = await res?.json();
        if (data?.success) {
          setExpenses(data?.data || []); // Assuming API returns { success: true, data: [expenses] }
        } else {
          throw new Error("Error fetching expenses");
        }
      } catch (error) {
        toast.error(error?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [groupID]);

  const toggleExpand = (expenseId) => {
    setExpandedExpenses((prev) =>
      prev.includes(expenseId)
        ? prev.filter((id) => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  if (loading) {
    return <p className="p-4">Loading expenses...</p>;
  }

  if (!expenses?.length) {
    return <p className="p-4">No expenses found.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Expenses</h1>
      <div className="space-y-4">
        {expenses?.map((expense) => (
          <Card key={expense?.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>{expense?.description || "Expense"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Description:</strong> {expense?.description || "No description"}
              </p>
              <p>
                <strong>Amount:</strong> ${Number(expense?.amount)?.toFixed(2)}
              </p>
              <p>
                <strong>Paid by:</strong>{" "}
                {expense?.createdBy?.userName || "Unknown"}
              </p>
              <p>
                <strong>Date:</strong> {expense?.date ? format(new Date(expense?.date), "PPP") : "Unknown"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => toggleExpand(expense?.id)}>
                {expandedExpenses?.includes(expense?.id) ? "Hide Details" : "Show Details"}
              </Button>
            </CardFooter>
            {expandedExpenses?.includes(expense?.id) && (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">Expense Shares</h2>
                {expense?.shares?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={transformShares(expense?.shares)}
                        dataKey="share"
                        nameKey="userName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                      >
                        {transformShares(expense?.shares)?.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No share data available.</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BalancesPage;
