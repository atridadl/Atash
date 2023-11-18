import { NextResponse } from "next/server";

function handler() {
  return NextResponse.json(
    { message: "Private Pong!" },
    { status: 200, statusText: "SUCCESS" }
  );
}

export { handler as GET };
