import { Unkey } from "@unkey/api";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";

export const unkey = new Unkey({ token: env.UNKEY_ROOT_KEY });

export const validateApiKey = async (key: string) => {
  try {
    const res = await unkey.keys.verify({
      key,
    });
    return res.valid;
  } catch {
    return false;
  }
};

export const validateRequest = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  let isValidKey: boolean = false;
  // Get the auth bearer token if it exists
  if (req.headers.authorization) {
    const key = req.headers.authorization.split("Bearer ").at(1);
    if (key) {
      isValidKey = await validateApiKey(key);
    }
  }

  if (!isValidKey) {
    res.status(403).json({ error: "UNAUTHORIZED" });
  }

  return isValidKey;
};
