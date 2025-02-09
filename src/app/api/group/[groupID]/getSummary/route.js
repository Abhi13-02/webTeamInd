import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req, { params }) {
  const { groupID: groupId } = await params; 

  try {
    // Fetch group details including its members and each member's user info.
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Fetch all expenses in this group.
    const expenses = await db.expense.findMany({
      where: { groupId },
      select: {
        amount: true,
        createdById: true,
      },
    });

    // Fetch all expense shares for expenses in this group.
    const expenseShares = await db.expenseShare.findMany({
      where: {
        expense: {
          groupId,
        },
      },
      select: {
        share: true,
        userId: true,
      },
    });

    // Fetch all settlements for this group.
    const settlements = await db.settlement.findMany({
      where: { groupId },
      select: {
        amount: true,
        fromUserId: true,
        toUserId: true,
      },
    });

    // Aggregate information for each member of the group.
    const memberAggregates = group.members.map((member) => {
      const memberId = member.userId;

      const clerkUserId = member.user.clerkUserID;

      // Sum expenses where this member is the creator.
      const totalPaid = expenses
        .filter((exp) => exp.createdById === memberId)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      // Sum all expense shares assigned to this member.
      const totalShare = expenseShares
        .filter((es) => es.userId === memberId)
        .reduce((sum, es) => sum + Number(es.share), 0);

      // Sum of settlements where this member is the recipient.
      const settlementCredit = settlements
        .filter((s) => s.toUserId === memberId)
        .reduce((sum, s) => sum + Number(s.amount), 0);

      // Sum of settlements where this member is the payer.
      const settlementDebit = settlements
        .filter((s) => s.fromUserId === memberId)
        .reduce((sum, s) => sum + Number(s.amount), 0);

      const settlementBalance = settlementCredit - settlementDebit;
      const netBalance = totalPaid - totalShare + settlementBalance;

      // console.log("getsummary", member.user.userName)

      return {
        clerkUserId,
        userId: memberId,
        role: member.role,
        userName: member.user.userName,
        email: member.user.email,
        imageUrl: member.user.imageUrl,
        totalPaid,
        totalShare,
        settlementCredit,
        settlementDebit,
        settlementBalance,
        netBalance,
      };
    });

    // Return the aggregated summary data.
    return NextResponse.json({
      success: true,
      data: {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          goalBudget: group.goalBudget,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        },
        members: memberAggregates,
      },
    });
  } catch (error) {
    console.error("Error in group summary API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
