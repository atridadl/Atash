import { type ActionFunctionArgs, json } from "@remix-run/node";
import { Webhook } from "svix";
import { type WebhookEvent } from "@clerk/remix/api.server";
import {
  onUserCreatedHandler,
  onUserDeletedHandler,
} from "~/services/webhookhelpers.server";
import "dotenv/config";

export async function action({ request, params, context }: ActionFunctionArgs) {
  // Get the headers
  const headerPayload = request.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const body = JSON.stringify(await request.json());

  // Create a new SVIX instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;
  let success = false;

  switch (eventType) {
    case "user.created":
      success = await onUserCreatedHandler(id);
      if (success) {
        return json(
          { result: "USER CREATED" },
          { status: 200, statusText: "USER CREATED" }
        );
      } else {
        return json(
          { result: "USER WITH THIS ID NOT FOUND" },
          { status: 404, statusText: "USER WITH THIS ID NOT FOUND" }
        );
      }

    case "user.deleted":
      success = await onUserDeletedHandler(id);

      return json(
        { result: "USER DELETED" },
        { status: 200, statusText: "USER DELETED" }
      );

    default:
      return json(
        { result: "INVALID WEBHOOK EVENT TYPE" },
        { status: 400, statusText: "INVALID WEBHOOK EVENT TYPE" }
      );
  }
}
