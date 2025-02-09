import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req, { params }) {
  // Extract groupID from params. Ensure your folder is named [groupID].
  const { groupID: groupId } = params;

  try {
    // Delete all settlement records for the given group.
    const result = await db.settlement.deleteMany({
      where: { groupId },
    });

    return NextResponse.json(
      { success: true, data: { deletedCount: result.count } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing settlements:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
