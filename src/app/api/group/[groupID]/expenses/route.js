import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req, { params }) {
  // Extract groupID from params (ensure your folder name matches [groupID])
  const { groupID: groupId } = params;

  try {
    // Fetch all expenses for the group, including all attributes and relations.
    const expenses = await db.expense.findMany({
      where: { groupId },
      orderBy: { date: "desc" },
      include: {
        // Include the entire related Group object.
        group: true,
        // Include the entire related User object for the creator.
        createdBy: true,
        // Include all expense shares.
        shares: {
            include: {
              user: true,  // This will include the related user object for each share.
            }
        }
      },
    });

    return NextResponse.json({ success: true, data: expenses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
