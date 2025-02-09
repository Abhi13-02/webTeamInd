// app/api/group/[groupID]/myDues/route.js

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

    // Query unsettled settlements for this group where the current user owes money.
    const dues = await db.settlement.findMany({
      where: {
        groupId,
        fromUserId: user.id,
        settled: false,
      },
      include: {
        // Include details about the creditor.
        toUser: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Convert Decimal and Date fields to plain types.
    const plainDues = dues.map((d) => ({
      id: d.id,
      groupId: d.groupId,
      fromUserId: d.fromUserId,
      toUserId: d.toUserId,
      amount: d.amount.toString(),
      settled: d.settled,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      toUserName: d.toUser?.userName || "Unknown",
    }));

    return NextResponse.json({ success: true, data: plainDues }, { status: 200 });
  } catch (error) {
    console.error("Error fetching my dues:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
