"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WhoOwesMePage = () => {
  const { groupID } = useParams();
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupID) return;
    const fetchReceivables = async () => {
      try {
        const res = await fetch(`/api/group/${groupID}/whoOwesMe`);
        if (!res.ok) {
          throw new Error("Failed to fetch receivables");
        }
        const data = await res.json();
        if (data.success) {
          setReceivables(data.data);
        } else {
          throw new Error("Error fetching receivables");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchReceivables();
  }, [groupID]);

  const handleMarkSettled = async (settlementId) => {
    try {
      const res = await fetch(`/api/group/${groupID}/whoOwesMe/markSettled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settlementId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to mark settlement");
      }
      toast.success("Settlement marked as settled");
      setReceivables((prev) => prev.filter((r) => r.id !== settlementId));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  if (loading) {
    return <p className="p-4">Loading receivables...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Who Owes Me</h1>
      {receivables.length === 0 ? (
        <p className="text-gray-500">No one owes you any money!</p>
      ) : (
        <div className="space-y-4">
          {receivables.map((r) => (
            <Card key={r.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>From:{r.expensePaidBy}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Amount:</strong> ${Number(r.amount).toFixed(2)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end items-center">
                <Button variant="destructive" onClick={() => handleMarkSettled(r.id)}>
                  Mark as Settled
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhoOwesMePage;
