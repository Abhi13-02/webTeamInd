import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req, { params }) {
  const { groupID:groupId } = params; // Get groupId from the dynamic route

  try {
    // Get the Clerk user ID from authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "User not authorized" }, { status: 401 });
    }

    // Look up the current user's record in the database using the Clerk ID
    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the incoming data (expected in JSON format)
    const { description, amount, splittingMethod, date } = await req.json();
    if (!amount || !splittingMethod) {
      return NextResponse.json(
        { error: "Missing required fields: amount and splittingMethod" },
        { status: 400 }
      );
    }

    // Create the new expense.
    const newExpense = await db.expense.create({
      data: {
        groupId: groupId,
        createdById: user.id,
        description: description || null,
        amount: amount, // Ensure the amount is a valid number/decimal
        splittingMethod: splittingMethod,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    
    const errorMessage = error && typeof error.message === "string" ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
