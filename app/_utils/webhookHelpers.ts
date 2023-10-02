import { and, eq, isNull } from "drizzle-orm";
import { db } from "../_lib/db";
import { rooms } from "../_lib/schema";
import { env } from "env.mjs";

export const onUserDeletedHandler = async (userId: string | undefined) => {
  if (!userId) {
    return false;
  }

  try {
    await db
      .delete(rooms)
      .where(and(eq(rooms.userId, userId || ""), isNull(rooms.orgId)));

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

  return userUpdateResponse.ok;
};

export const onOrgDeleltedHandler = async (orgId: string | undefined) => {
  if (!orgId) {
    return false;
  }

  try {
    await db.delete(rooms).where(eq(rooms.orgId, orgId));

    return true;
  } catch (error) {
    return false;
  }
};
