import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req, { params }) {
  // Extract groupID from params (ensure your folder is named [groupID])
  const { groupID: groupId } = params;

  try {
    // Authenticate the user with Clerk.
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "User not authorized" }, { status: 401 });
    }

    // Find the current user in our database using Clerk's userId.
    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the request body for settlementId.
    const { settlementId } = await req.json();
    if (!settlementId) {
      return NextResponse.json({ error: "Missing settlementId" }, { status: 400 });
    }

    // Update the settlement record: only update if the current user is the creditor (toUserId) and the settlement is unsettled.
    const result = await db.settlement.updateMany({
      where: {
        id: settlementId,
        toUserId: user.id,
        settled: false,
      },
      data: {
        settled: true,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "No matching settlement record found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { updatedCount: result.count } }, { status: 200 });
  } catch (error) {
    console.error("Error marking settlement as settled:", error);
    const errorMessage =
      error && typeof error.message === "string" ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
