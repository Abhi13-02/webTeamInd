// app/api/group/[groupID]/whoOwesMe/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  const { groupID: groupId } = await params;

  try {
    // Authenticate and get current user via Clerk.
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "User not authorized" }, { status: 401 });
    }

    // Find the current user in our database.
    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Query unsettled settlements for this group where the current user is the creditor.
    const receivables = await db.settlement.findMany({
      where: {
        groupId,
        toUserId: user.id,
        settled: false,
      },
      include: {
        // Include details about the debtor.
        fromUser: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Convert Decimal and Date fields to plain types.
    const plainReceivables = receivables.map((r) => ({
      id: r.id,
      groupId: r.groupId,
      fromUserId: r.fromUserId,
      toUserId: r.toUserId,
      amount: r.amount.toString(),
      settled: r.settled,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      fromUserName: r.fromUser?.userName || "Unknown",
    }));

    return NextResponse.json({ success: true, data: plainReceivables }, { status: 200 });
  } catch (error) {
    console.error("Error fetching who owes me:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
