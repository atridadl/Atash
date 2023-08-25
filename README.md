# T3 Clerk Drizzle Starter

A T3 Clerk Drizzle Starter template based on Sprint Padawan.

## Features

- Authentication
- Orgs
- API Keys
- Rate Limiting
- Caching
- Public, Private, Internal (tRPC), and Webhook functions
- 🔪 Edge 🔪 runtime
- Real-time pub/sub
- Real-time presence

## Stack

- Front-end framework: Nextjs
- Front-end library: React
- Rendering method: SSR SPA
- Hosting: Vercel
- Real-time pub/sub: Ably
- ORM: Drizzle
- Auth: Clerk
- API Key Management: Unkey
- Database: Neon (PostgreSQL)
- Cache: Upstash (Redis)

## Instructions

- First set up accounts on Vercel, Neon, Clerk, Unkey, Upstash, and Ably
- Create projects on all of those services
- Run the `pnpm init:env` command to generate a .env file to fill out
- Ensure that the webhook url https://DOMAIN.TLD/api/webhooks is added with the user.created and user.deleted events
- For the Headers: please generate an Unkey key and pass it in the headers as a Bearer token for the webhook
- Set the proper regions for your edge public/private/webhook functions:

```Javascript
export const config = {
  runtime: "edge",
  regions: ["pdx1"], // This can handle more than one region, or be removed for usage on any region!
};
```

## Why so many services?

While self hosting or using something like AWS can achieve the same results, I am partial to making use of services that are very good at their niche. For instance: Clerk does one thing and does it VERY well... Authentication. The same can be said for Ably, Vercel, Unkey, Upstash, or Neon. All of these services have generous free tiers and very cheap scaling. Yes: its a lot of accounts, but its worth it. The best part here is with the exception of Ably and Clerk, everything here can be self-hosted. You can run Next on a node server, you can roll a Postgres or Redis DB, and you can generate your own API Keys. You can move to an EC2 if needed, which makes this stack quite flexible.

## Why no testing?

I prefer building projects that have are easy to iterate on rather than relying on tests. That being said, tests can be added as shown in the [Next.js Documentation](https://nextjs.org/docs/pages/building-your-application/optimizing/testing).

## Contributing

Feel free to propose changes via PR. I'm not awfully picky about formatting right now, so I'll accept/reject on a case-by-case basis. Please make sure to have an issue first though.
