"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SettleUp = () => {
  // Extract the groupID from the route parameters.
  const { groupID } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupID) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/group/${groupID}/settlingUp`);
        if (!res.ok) {
          throw new Error("Failed to fetch settle up transactions");
        }
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data.transactions);
        } else {
          throw new Error("Error fetching transactions");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [groupID]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settle Up Transactions</h1>
      {loading ? (
        <p>Loading settle up transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">All balances are settled!</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Transaction #{index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <span className="font-bold">From:</span> {tx.fromUserName}
                </p>
                <p>
                  <span className="font-bold">To:</span> {tx.toUserName}
                </p>
                <p>
                  <span className="font-bold">Amount:</span> ${Number(tx.amount).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettleUp;
