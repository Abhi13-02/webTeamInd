import { currentUser } from "@clerk/nextjs/server"; 
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  try {
    // Check if the user already exists based on their Clerk ID
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserID: user.id,
      },
    });
    if (loggedInUser) {
      return loggedInUser;
    }
    
    const userName = `${user.firstName} ${user.lastName}`;
    const email =
      user.emailAddresses && user.emailAddresses.length > 0
        ? user.emailAddresses[0].emailAddress
        : "";
    
    // Use the profile image URL from Clerk; if not provided, default to an empty string.
    const imageUrl = user.imageUrl || "";

    // Create the new user in your database.
    const newUser = await db.user.create({
      data: {
        clerkUserID: user.id,
        email: email,
        imageUrl: imageUrl,
        userName: userName,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error creating or retrieving user:", error);
  }
};
