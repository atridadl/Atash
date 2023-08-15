import { eq } from "drizzle-orm";
import { db } from "./db";
import { logs, rooms, votes } from "./schema";
import { env } from "~/env.mjs";
import type { NextApiResponse } from "next";

export const onUserDeletedHandler = async (
  userId: string,
  res: NextApiResponse
) => {
  try {
    await db.delete(rooms).where(eq(rooms.userId, userId));
    await db.delete(logs).where(eq(logs.userId, userId));
    await db.delete(votes).where(eq(votes.userId, userId));

    res.status(200).json({ result: "USER DELETED" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const onUserCreatedHandler = async (
  userId: string,
  res: NextApiResponse
) => {
  const userUpdateResponse = await fetch(
    `https://api.clerk.com/v1/users/${userId}/metadata`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
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

  if (userUpdateResponse.ok) {
    res.status(200).json({ result: "USER CREATED" });
  } else {
    res.status(404).json({ error: "USER WITH THIS ID NOT FOUND" });
  }
};
