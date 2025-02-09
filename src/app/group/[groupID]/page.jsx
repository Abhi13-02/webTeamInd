"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format, set } from "date-fns";
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
import { Bar } from "recharts";
import BarGraphs from "@/components/visuals/BarGraphs";
import PieCharts from "@/components/visuals/PieCharts";

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
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [barData, setBarData] = useState([]);

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

  useEffect(() => {
    const exampleData = members.map((member) => ({
      userName: member.userName,
      totalPaid: member.totalPaid,
      totalShare: member.totalShare,
      settlementCredit: member.settlementCredit,
      settlementDebit: member.settlementDebit,
      settlementBalance: member.settlementBalance,
      netBalance: member.netBalance,
    }));
    setBarData(exampleData);
  }, [members]);
  

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
        // Expecting response to be in the form: { success: true, data: { group: { ... }, members: [...] } }
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
      window.location.reload()
      setExpenseDrawerOpen(false);
      // Optionally, refresh the group summary or update local state as needed.
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

  // Calculate progress for the goal budget.
  const goalBudget = group.goalBudget ? parseFloat(group.goalBudget) : 0;
  // Assuming group.currentExpense is provided by the API.
  const currentExpense = group.currentExpense ? parseFloat(group.currentExpense) : 0;
  const progressPercent = goalBudget > 0 ? Math.min((currentExpense / goalBudget) * 100, 100) : 0;
  const progressBarColor = currentExpense > goalBudget ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="p-4">
      {/* Group Name */}
      <h1 className="text-2xl font-bold mb-4">{group.name} Summary</h1>
      
      {/* Progress Bar */}
      {goalBudget > 0 && (
        <div className="mb-6">
          <div className="mb-1 text-sm font-medium text-gray-700">
            Budget Progress: {currentExpense} / {goalBudget}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`${progressBarColor} h-4 rounded-full`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* New Expense Button */}
      <div className="mt-6">
        <Button onClick={() => setExpenseDrawerOpen(true)} variant="outline">
          New Expense
        </Button>
      </div>

      {/* Bar Graphs */}
      <PieCharts data={barData} />
      <BarGraphs data={barData} />

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

// Inline DatePicker Component using Popover and Calendar
// function DatePicker({ value, onChange, className }) {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button variant="outline" className={className}>
//           {value ? format(value, "PPP") : "Select date"}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="p-0">
//         <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
//       </PopoverContent>
//     </Popover>
//   );
// }
