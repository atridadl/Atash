import { verifyKey } from "@unkey/api";
import type { NextRequest } from "next/server";

export const validateRequest = async (req: NextRequest) => {
  const authorization = req.headers.get("authorization");
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
