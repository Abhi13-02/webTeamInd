"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MyDuesPage = () => {
  const { groupID } = useParams();
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupID) return;
    const fetchDues = async () => {
      try {
        const res = await fetch(`/api/group/${groupID}/myDues`);
        if (!res.ok) {
          throw new Error("Failed to fetch my dues");
        }
        const data = await res.json();
        if (data.success) {
          setDues(data.data);
        } else {
          throw new Error("Error fetching dues");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDues();
  }, [groupID]);

  const handleMarkSettled = async (settlementId) => {
    try {
      const res = await fetch(`/api/group/${groupID}/myDues/markSettled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settlementId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to mark settlement");
      }
      toast.success("Settlement marked as settled");
      setDues((prev) => prev.filter((due) => due.id !== settlementId));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  if (loading) {
    return <p className="p-4">Loading my dues...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Dues</h1>
      {dues.length === 0 ? (
        <p className="text-gray-500">You have no outstanding dues!</p>
      ) : (
        <div className="space-y-4">
          {dues.map((due) => (
            <Card key={due.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>{due.toUserName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Amount:</strong> ${Number(due.amount).toFixed(2)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end items-center">
                <Button variant="destructive" onClick={() => handleMarkSettled(due.id)}>
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

export default MyDuesPage;
