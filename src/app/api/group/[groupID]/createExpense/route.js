import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function POST(req, { params }) {
  // Destructure groupID from params; note: ensure your folder name matches "groupID" exactly.
  const { groupID: groupId } = await params;
  
  try {
    // Get the Clerk user ID from authentication.
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "User not authorized" }, { status: 401 });
    }

    // Look up the current user's record in the database using the Clerk ID.
    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the incoming data (expected in JSON format).
    const { description, amount, splittingMethod, date, customSplit } = await req.json();
    if (!amount || !splittingMethod) {
      return NextResponse.json(
        { error: "Missing required fields: amount and splittingMethod" },
        { status: 400 }
      );
    }

    // Create the new expense record.
    const newExpense = await db.expense.create({
      data: {
        groupId: groupId,
        createdById: user.id,
        description: description || null,
        amount: amount, // make sure this value is a valid Decimal (or number)
        splittingMethod: splittingMethod,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Fetch the group with its members.
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        members: true, // group.members is an array of GroupMember records (each with a userId, etc.)
      },
    });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    const groupMembers = group.members;

    if (splittingMethod === "EVEN") {
      // Even split: each member's share equals amount / number of members.
      const numMembers = groupMembers.length;
      const shareAmount = parseFloat(amount) / numMembers;

      // Create ExpenseShare records in bulk.
      await db.expenseShare.createMany({
        data: groupMembers.map((member) => ({
          expenseId: newExpense.id,
          userId: member.userId,
          share: shareAmount,
        })),
      });

      // Create Settlement records for every member (except the expense creator).
      for (const member of groupMembers) {
        if (member.userId !== user.id) {
          await db.settlement.create({
            data: {
              groupId: groupId,
              fromUserId: member.userId,
              toUserId: user.id,
              amount: shareAmount,
              settled: false,
            },
          });
        }
      }
    } else if (splittingMethod === "CUSTOM") {
      // CUSTOM split: Ensure customSplit is provided.
      if (!customSplit) {
        return NextResponse.json(
          { error: "Missing customSplit data for CUSTOM splitting method" },
          { status: 400 }
        );
      }
      // For each group member, create an ExpenseShare using the provided custom split.
      for (const member of groupMembers) {
        const shareValue = customSplit[member.userId];
        if (shareValue === undefined) {
          return NextResponse.json(
            { error: `Missing custom split amount for member ${member.userId}` },
            { status: 400 }
          );
        }
        await db.expenseShare.create({
          data: {
            expenseId: newExpense.id,
            userId: member.userId,
            share: shareValue,
          },
        });
        // If the member is not the expense creator, create a Settlement record.
        if (member.userId !== user.id) {
          await db.settlement.create({
            data: {
              groupId: groupId,
              fromUserId: member.userId,
              toUserId: user.id,
              amount: shareValue,
              settled: false,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    const errorMessage =
      error && typeof error.message === "string" ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
