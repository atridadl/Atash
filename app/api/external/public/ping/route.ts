import { NextResponse } from "next/server";

function handler() {
  return NextResponse.json(
    { message: "Public Pong!" },
    { status: 200, statusText: "SUCCESS" }
  );
}

export { handler as GET };
