# T3 Clerk Drizzle Starter

A T3 Clerk Drizzle Starter template based on Sprint Padawan.

## Features

- Authentication
- Orgs
- Voting
- Room creation
- Real-time presence

## Stack

- Front-end framework: Nextjs
- Front-end library: React
- Rendering method: SSR SPA
- Hosting: Vercel
- Real-time pub/sub: Ably
- ORM: Drizzle
- Database: Neon (PostgreSQL)
- Cache: Upstash (Redis)

## Instructions

- First set up accounts on Vercel, Neon, Clerk, Unkey, Upstash, and Ably
- Create projects on all of those services
- Copy the .env.example and name it .env: fill out all of the environment variables
- Ensure that the webhook url https://DOMAIN.TLD/api/webhooks is added with the approproate events, Unkey auth tokens, and content type of JSON
- Set the proper regions for your edge public/private/webhook functions:

```Javascript
export const config = {
  runtime: "edge",
  regions: ["pdx1"], // This can handle more than one region, or be removed for usage on any region!
};
```

## Versioning

- I use a bastardized version of semantic versioning. I jump to a new minor release whenever I feel like I made enough patch releases.
- All released are named using the corperate BS generator, found [here](https://www.atrixnet.com/bs-generator.html).

## Contributing

Feel free to propose changes via PR. I'm not awfully picky about formatting right now, so I'll accept/reject on a case-by-case basis. Please make sure to have an issue first though.
