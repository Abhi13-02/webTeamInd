// app/api/myDues/markSettled/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "User not authorized" }, { status: 401 });
    }

    // Find the current user in the database.
    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { settlementId } = await req.json();
    if (!settlementId) {
      return NextResponse.json({ error: "Missing settlementId" }, { status: 400 });
    }

    // Update the settlement if it belongs to the current user and is unsettled.
    const result = await db.settlement.updateMany({
      where: {
        id: settlementId,
        fromUserId: user.id,
        settled: false,
      },
      data: {
        settled: true,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "No matching settlement found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { updatedCount: result.count } }, { status: 200 });
  } catch (error) {
    console.error("Error marking settlement as settled:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
