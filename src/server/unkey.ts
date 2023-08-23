// import { Unkey, verifyKey } from "@unkey/api";
import { verifyKey } from "@unkey/api";
import type { NextRequest } from "next/server";
// import { env } from "~/env.mjs";

// const unkey = new Unkey({token: env.UNKEY_ROOT_KEY})

export const validateRequest = async (req: NextRequest) => {
  const authorization = req.headers.get("authorization");
  // Get the auth bearer token if it exists
  if (authorization) {
    const key = authorization.split("Bearer ").at(1);
    if (key) {
      const { error, result } = await verifyKey(key);

      if (!error) {
        console.log(result);
        return result.valid;
      }
    }
  }

  return false;
};
