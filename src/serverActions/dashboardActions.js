"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createGroup(data) {
  try {
    // Retrieve the currently authenticated user's Clerk ID.
    const { userId } = await auth();
    if (!userId) throw new Error("User unauthorized");

    // Find the user in your database based on their Clerk ID.
    const user = await db.user.findUnique({
      where: { clerkUserID: userId },
    });
    if (!user) throw new Error("User not found");

    // Prepare additional members if provided.
    // data.members is expected to be an array of user IDs (strings).
    const additionalMembers = data.members
      ? data.members.map((memberId) => ({
          userId: memberId,
          role: "MEMBER", // Default role for additional members
        }))
      : [];

    // Create the group with nested writes for group members.
    // The creator is added automatically as an ADMIN.
    const newGroup = await db.group.create({
      data: {
        name: data.name,
        description: data.description || null,
        goalBudget: data.goalBudget || null,
        createdBy: user.id,
        members: {
          create: [
            { userId: user.id, role: "ADMIN" }, // Creator becomes ADMIN
            ...additionalMembers,
          ],
        },
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: newGroup };
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error(error.message || "Error creating group");
  }
}



export async function deleteGroup(groupId) {
  try {
    // Get the Clerk user ID from authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("User unauthorized");

    // Look up the current user's record in the database using the Clerk ID.
    const user = await db.user.findUnique({
      where: { clerkUserID: clerkUserId },
    });
    if (!user) throw new Error("User not found");

    // Fetch the group that is to be deleted.
    const group = await db.group.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new Error("Group not found");

    // Ensure that the current user is the creator (i.e. the admin) of the group.
    if (group.createdBy !== user.id) {
      throw new Error("User is not authorized to delete this group");
    }

    // Delete the group. Cascade delete actions on related models (members, expenses, settlements)
    // will automatically remove associated records.
    const deletedGroup = await db.group.delete({
      where: { id: groupId },
    });

    revalidatePath("/dashboard");

    return { success: true, data: deletedGroup };
  } catch (error) {
    console.error("Error deleting group:", error);
    throw new Error(error.message);
  }
}



export async function getGroupsForUser() {
  try {
    // Retrieve the currently authenticated user's Clerk ID.
    const { userId } = await auth();
    if (!userId) throw new Error("User unauthorized");

    // Find the user in your database based on their Clerk ID.
    const user = await db.user.findUnique({
      where: {
        clerkUserID: userId,
      },
    });
    if (!user) throw new Error("User not found");

    const groups = await db.group.findMany({
      where: {
        OR: [
          // Groups created by the user
          { createdBy: user.id },
          // Groups where the user is a member (as admin or member)
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        // Include the creator information
        creator: {
          select: {
            clerkUserID: true,
            email: true,
            userName: true,
          }
        },
        // Include members with their role and basic user info
        members: {
          select: {
            role: true,
            // Including basic user fields; adjust as needed
            user: {
              select: {
                id: true,
                email: true,
                userName: true,
                imageUrl: true,
              },
            },
          },
        },
        // Optionally include expenses and settlements if needed
        expenses: true,
        settlements: true,
      },
    });
    return { success: true, data: groups };
  } catch (error) {
    console.error("Error getting groups for user:", error);
    throw new Error(error.message);
  }
}
