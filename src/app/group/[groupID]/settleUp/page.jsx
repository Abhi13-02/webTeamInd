"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SettleUp = () => {
  // Extract the groupID from the route parameters.
  const { groupID } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch settle-up transactions for the group.
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

  // Handler to mark a single transaction as settled.
  // (Existing code with checkbox removed; we now clear all at once.)
  // ...

  // Handler to clear all settlement entries.
  const handleClearSettlements = async () => {
    try {
      const res = await fetch(`/api/group/${groupID}/clearSettlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to clear settlements");
      }
      toast.success("All settlements cleared successfully");
      // Optionally, refresh transactions after clearing.
      setTransactions([]);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  if (loading) {
    return <p className="p-4">Loading settle up transactions...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settle Up Transactions</h1>
      {transactions.length === 0 ? (
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
      {/* Button to clear all settlements */}
      {transactions.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button variant="destructive" onClick={handleClearSettlements}>
            Clear All Settlements
          </Button>
        </div>
      )}
    </div>
  );
};

export default SettleUp;
