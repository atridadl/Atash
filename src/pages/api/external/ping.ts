import type { NextApiRequest, NextApiResponse } from "next";
import { validateRequest } from "~/server/unkey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isValid = await validateRequest(req, res);

  if (isValid) {
    res.status(200).json({ result: "Pong!" });
  }
}
