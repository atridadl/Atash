import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { validateRequest } from "~/server/unkey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isValid = await validateRequest(req, res);

  if (isValid) {
    await db.query.votes.findFirst();
    res.status(200).json({ result: "Pong!" });
  }
}
