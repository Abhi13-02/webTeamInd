import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req, { params }) {
  const { groupID: groupId } = params; 

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
        splittingMethod: true,
      },
    });

    // Fetch all expense shares for CUSTOM expenses in this group.
    // (Assuming that for EVEN splitting, we won't rely on these records.)
    const expenseShares = await db.expenseShare.findMany({
      where: {
        expense: { groupId },
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

    // Compute the total expense for the group.
    const currentExpense = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0
    );

    // Aggregate information for each member of the group.
    const memberAggregates = group.members.map((member) => {
      const memberId = member.userId;
      
      // Total paid is the sum of amounts for expenses created by the member.
      const totalPaid = expenses
        .filter(exp => exp.createdById === memberId)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      // Compute total share for EVEN expenses: for each EVEN expense,
      // each member owes expense.amount / totalMembers.
      const totalShareEven = expenses
        .filter(exp => exp.splittingMethod === "EVEN")
        .reduce(
          (sum, exp) => sum + Number(exp.amount) / group.members.length,
          0
        );

      // For CUSTOM expenses, use the ExpenseShare records.
      const totalShareCustom = expenseShares
        .filter(es => es.userId === memberId)
        .reduce((sum, es) => sum + Number(es.share), 0);

      // Total share is the sum of even split shares and custom shares.
      const totalShare = totalShareEven + totalShareCustom;

      // Settlements: sum credits (where member is recipient) and debits (where member is payer)
      const settlementCredit = settlements
        .filter(s => s.toUserId === memberId)
        .reduce((sum, s) => sum + Number(s.amount), 0);
      const settlementDebit = settlements
        .filter(s => s.fromUserId === memberId)
        .reduce((sum, s) => sum + Number(s.amount), 0);
      const settlementBalance = settlementCredit - settlementDebit;

      // netBalance = totalPaid - totalShare + settlementBalance.
      const netBalance = totalPaid - totalShare + settlementBalance;

      return {
        userId: memberId,
        userName: member.user.userName,
        netBalance,
      };
    });

    // Greedy algorithm to settle debts.
    // Separate members into creditors (netBalance > 0) and debtors (netBalance < 0).
    let creditors = memberAggregates
      .filter(m => m.netBalance > 0)
      .sort((a, b) => b.netBalance - a.netBalance);
    let debtors = memberAggregates
      .filter(m => m.netBalance < 0)
      .sort((a, b) => a.netBalance - b.netBalance);

    const transactions = [];

    while (creditors.length > 0 && debtors.length > 0) {
      const creditor = creditors[0];
      const debtor = debtors[0];

      const amount = Math.min(creditor.netBalance, -debtor.netBalance);
      
      transactions.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount,
      });

      creditor.netBalance -= amount;
      debtor.netBalance += amount;

      if (Math.abs(creditor.netBalance) < 0.001) {
        creditors.shift();
      }
      if (Math.abs(debtor.netBalance) < 0.001) {
        debtors.shift();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          goalBudget: group.goalBudget,
          currentExpense,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        },
        members: memberAggregates,
        transactions,
      },
    });
  } catch (error) {
    console.error("Error in group summary API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
