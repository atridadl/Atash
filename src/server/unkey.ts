import { Unkey } from "@unkey/api";
import { NextRequest } from "next/server";
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

export const validateRequest = async (req: NextRequest) => {
  let isValidKey: boolean = false;

  const authorization = req.headers.get("authorization");
  // Get the auth bearer token if it exists
  if (authorization) {
    const key = authorization.split("Bearer ").at(1);
    if (key) {
      isValidKey = await validateApiKey(key);
    }
  }

  return isValidKey;
};
