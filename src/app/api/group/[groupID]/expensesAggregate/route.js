// app/api/group/[groupID]/expensesAggregate/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

function groupByPeriod(date, period) {
  const d = new Date(date);
  if (period === "year") {
    return d.getFullYear().toString();
  } else if (period === "month") {
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // months are zero-indexed
    return `${year}-${month < 10 ? "0" + month : month}`;
  } else if (period === "week") {
    // Calculate ISO week number
    const dCopy = new Date(d.getTime());
    dCopy.setHours(12, 0, 0, 0);
    // Thursday in current week determines the year.
    dCopy.setDate(dCopy.getDate() + 3 - ((dCopy.getDay() + 6) % 7));
    const week1 = new Date(dCopy.getFullYear(), 0, 4);
    const weekNumber = Math.round((((dCopy - week1) / 86400000) - 3 + ((week1.getDay() + 6) % 7)) / 7) + 1;
    return `${dCopy.getFullYear()}-W${weekNumber < 10 ? "0" + weekNumber : weekNumber}`;
  }
  return "";
}

export async function GET(req, { params }) {
  const { groupID: groupId } = params;

  // Get the grouping period from the query string; default to "month"
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "month";

  try {
    // Fetch all expenses for the group, including the creator details.
    const expenses = await db.expense.findMany({
      where: { groupId },
      include: {
        createdBy: true,
      },
      orderBy: { date: "asc" },
    });

    // Transform each expense into a plain JS object.
    const expenseData = expenses.map(exp => ({
      amount: Number(exp.amount),
      date: exp.date,
      memberName: exp.createdBy?.userName || "Unknown",
    }));

    // Aggregate data: For each expense, group by period, then sum amounts per member.
    const aggregated = {};
    expenseData.forEach(exp => {
      const periodKey = groupByPeriod(exp.date, period);
      if (!aggregated[periodKey]) {
        aggregated[periodKey] = { period: periodKey };
      }
      if (!aggregated[periodKey][exp.memberName]) {
        aggregated[periodKey][exp.memberName] = 0;
      }
      aggregated[periodKey][exp.memberName] += exp.amount;
    });

    // Convert aggregated object to an array sorted by period.
    const result = Object.values(aggregated).sort((a, b) => a.period.localeCompare(b.period));

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error aggregating expenses:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
