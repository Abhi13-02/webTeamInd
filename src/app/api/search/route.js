// app/api/search/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request) {
  // Extract the query parameter from the request URL.
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  // If no query is provided, return an empty array.
  if (!query || query.trim() === "") {
    return NextResponse.json([], { status: 200 });
  }

  try {
    // Search the User table for records where userName or email contains the query.
    const results = await db.user.findMany({
      where: {
        OR: [
          { userName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        userName: true,
        email: true,
        imageUrl: true,
      },
    });
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    const errorMessage =
      error && typeof error.message === "string"
        ? error.message
        : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
