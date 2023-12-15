import { eq } from "drizzle-orm";
import { db } from "./db.server";
import { rooms } from "./schema.server";
import "dotenv/config";

export const onUserDeletedHandler = async (userId: string | undefined) => {
  if (!userId) {
    return false;
  }

  try {
    await db.delete(rooms).where(eq(rooms.userId, userId));

    return true;
  } catch (error) {
    return false;
  }
};

export const onUserCreatedHandler = async (userId: string | undefined) => {
  if (!userId) {
    return false;
  }

  const userUpdateResponse = await fetch(
    `https://api.clerk.com/v1/users/${userId}/metadata`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          isVIP: false,
          isAdmin: false,
        },
        private_metadata: {},
        unsafe_metadata: {},
      }),
    }
  );

  return userUpdateResponse.ok;
};
