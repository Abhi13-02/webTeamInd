"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Inline DatePicker Component using Popover and Calendar
function DatePicker({ value, onChange, className }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          {value ? format(value, "PPP") : "Select date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

export default function SummaryPage() {
  // Extract the groupID from the route parameters
  const { groupID } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for controlling the expense creation drawer
  const [expenseDrawerOpen, setExpenseDrawerOpen] = useState(false);

  // Expense form state
  const [expenseFormData, setExpenseFormData] = useState({
    amount: "",
    description: "",
    splittingMethod: "EVEN", // default splitting method
    date: "",
  });
  const [expenseLoading, setExpenseLoading] = useState(false);

  // State for custom splitting amounts.
  // Keys are member user IDs and values are the amount each member paid.
  const [customSplit, setCustomSplit] = useState({});

  // Fetch the group summary when groupID is available
  useEffect(() => {
    if (!groupID) return;
    const fetchGroupSummary = async () => {
      try {
        const res = await fetch(`/api/group/${groupID}/getSummary`);
        if (!res.ok) {
          throw new Error("Failed to fetch group summary");
        }
        const data = await res.json();
        setGroup(data.data.group);
        setMembers(data.data.members);
      } catch (error) {
        toast.error(
          error.message || "Something went wrong while fetching the summary"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroupSummary();
  }, [groupID]);

  // Handle changes in the expense creation form (common fields)
  const handleExpenseInputChange = (e) => {
    setExpenseFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle changes for custom split inputs for each member
  const handleCustomSplitChange = (userId, value) => {
    setCustomSplit((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  // Handle expense form submission
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    // If custom split is selected, ensure the sum of amounts equals total amount.
    if (expenseFormData.splittingMethod === "CUSTOM") {
      const totalExpense = parseFloat(expenseFormData.amount);
      const sumCustom = Object.values(customSplit).reduce(
        (sum, val) => sum + parseFloat(val || 0),
        0
      );
      if (Math.abs(sumCustom - totalExpense) > 0.001) {
        toast.error("The sum of custom split amounts must equal the total expense amount.");
        return;
      }
      // Attach customSplit to payload if needed.
      expenseFormData.customSplit = customSplit;
    }

    setExpenseLoading(true);
    try {
      const res = await fetch(`/api/group/${groupID}/createExpense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseFormData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create expense");
      }
      await res.json();
      toast.success("Expense created successfully");
      setExpenseDrawerOpen(false);
      // Optionally, refresh the group summary or update local state as needed
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setExpenseLoading(false);
    }
  };

  if (loading) {
    return <p className="p-4">Loading group summary...</p>;
  }

  if (!group) {
    return <p className="p-4">Group not found.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{group.name} Summary</h1>
      
      {/* Group Description Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{group.description || "No description provided."}</p>
        </CardContent>
      </Card>

      {/* Group Members Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Total Members: {members ? members.length : 0}</p>
        </CardContent>
      </Card>

      {/* Button to open the New Expense drawer */}
      <div className="mt-6">
        <Button onClick={() => setExpenseDrawerOpen(true)} variant="outline">
          New Expense
        </Button>
      </div>

      {/* Link to navigate to the full group details page */}
      <div className="mt-6">
        <Button asChild variant="outline">
          <a href={`/group/${groupID}`}>Go to Group Details</a>
        </Button>
      </div>

      {/* Drawer for creating a new expense (opens from the bottom) */}
      <Drawer open={expenseDrawerOpen} onOpenChange={setExpenseDrawerOpen}>
        <DrawerContent className="p-6 fixed bottom-0 left-0 right-0">
          <DrawerHeader>
            <DrawerTitle>Create New Expense</DrawerTitle>
            <DrawerDescription>
              Fill out the form below to add a new expense.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={expenseFormData.amount}
                onChange={handleExpenseInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={expenseFormData.description}
                onChange={handleExpenseInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Splitting Method
              </label>
              <select
                name="splittingMethod"
                value={expenseFormData.splittingMethod}
                onChange={handleExpenseInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="EVEN">EVEN</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </div>
            {/* If CUSTOM is selected, render additional inputs for custom split */}
            {expenseFormData.splittingMethod === "CUSTOM" && members.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Custom Split Amounts
                </label>
                <div className="mt-1 space-y-2">
                  {members.map((member) => (
                    <div key={member.userId} className="flex items-center space-x-2">
                      <span className="w-32">
                        {member.userName || member.email}
                      </span>
                      <input
                        type="number"
                        name={member.userId}
                        placeholder="Amount"
                        value={customSplit[member.userId] || ""}
                        onChange={(e) =>
                          handleCustomSplitChange(member.userId, e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        step="0.01"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <DatePicker
                value={expenseFormData.date ? new Date(expenseFormData.date) : null}
                onChange={(date) =>
                  setExpenseFormData((prev) => ({
                    ...prev,
                    date: date ? date.toISOString().split("T")[0] : "",
                  }))
                }
                className="mt-1 block w-full"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={expenseLoading}>
                {expenseLoading ? "Creating..." : "Create Expense"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
