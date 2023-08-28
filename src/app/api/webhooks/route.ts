import { type NextRequest, NextResponse } from "next/server";
import {
  onUserCreatedHandler,
  onUserDeletedHandler,
} from "~/server/webhookHelpers";
import {
  type WebhookEventBody,
  WebhookEventBodySchema,
  WebhookEvents,
} from "~/utils/types";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

async function handler(req: NextRequest) {
  try {
    const eventBody = (await req.json()) as WebhookEventBody;
    const { data, type } = WebhookEventBodySchema.parse(eventBody);
    let success = false;

    switch (type) {
      case WebhookEvents.USER_CREATED:
        success = await onUserCreatedHandler(data.id);
        if (success) {
          return NextResponse.json(
            { result: "USER CREATED" },
            { status: 200, statusText: "USER CREATED" }
          );
        } else {
          return NextResponse.json(
            { result: "USER WITH THIS ID NOT FOUND" },
            { status: 404, statusText: "USER WITH THIS ID NOT FOUND" }
          );
        }

      case WebhookEvents.USER_DELETED:
        success = await onUserDeletedHandler(data.id);

        return NextResponse.json(
          { result: "USER DELETED" },
          { status: 200, statusText: "USER DELETED" }
        );

      default:
        return NextResponse.json(
          { result: "INVALID WEBHOOK EVENT TYPE" },
          { status: 400, statusText: "INVALID WEBHOOK EVENT TYPE" }
        );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { result: "INVALID WEBHOOK EVENT BODY" },
      { status: 400, statusText: "INVALID WEBHOOK EVENT BODY" }
    );
  }
}

export { handler as POST };
