![Atash Logo](https://github.com/atridadl/Atash/assets/88056492/620d2d1a-1862-42ce-bbe3-75fb640abbf2)

# Atash (آتش)

The 🔥hottest🔥 full-stack Next.js template!

Atash (آتش) is Persian or Farsi for Fire! Pronounced "Ahh-tash".

## Features

- 🔥 User Auth, API Auth, and Orgs!
- 🔥 Caching and Rate Limiting!
- 🔥 Fast queries with Drizzle!
- 🔥 Next.js App Router!
- 🔥 Edge Runtime!
- 🔥 Customizable Themes
- 🔥 100% free and open-source... forever!

## Stack

- Front-end framework: Nextjs
- Front-end library: React
- Rendering method: SSR SPA
- Hosting: Vercel
- Real-time pub/sub: Ably
- ORM: Drizzle ORM
- Auth: Clerk
- API Key Management: Unkey
- Database: Turso (Edge libSQL)
- Database Cache: Upstash (Redis)
- CSS: TailwindCSS + DaisyUI

## Instructions

- First set up accounts on Vercel, Turso, Clerk, Unkey, Upstash, and Ably
- Create projects on all of those services
- For Vercel, use global edge. For Upstash, use global with every region. For Turso, use at least one region in North America, Europe, and Asia.
- Run the `pnpm init:env` command to generate a .env file to fill out
- Ensure that the webhook url https://DOMAIN.TLD/api/webhooks is added with the user.created and user.deleted events
- You will need up a webhook to point to https://<domain.tld>/api/webhooks, and ensure you use the "Signing Secret" from the webhook as your CLERK_WEBHOOK_SIGNING_SECRET environment variable...
- For the Headers: please generate an Unkey key and pass it in the headers as a Bearer token for the webhook
- Set the proper regions for your edge public/private/webhook functions:

```Javascript
export const config = {
  runtime: "edge",
};
```

## Styling

The tailwind.config.js file will contain a list of themes that are added by default. To change the theme, change the value of "data-theme" on the html tag in src/app/layout.tsx. For more information on DaisyUI themes, please see their [documentation](https://daisyui.com/docs/themes/).

## Why so many services?

While self hosting or using something like AWS can achieve the same results, I am partial to making use of services that are very good at their niche. For instance: Clerk does one thing and does it VERY well... Authentication. The same can be said for Ably, Vercel, Unkey, Upstash, or Turso. All of these services have generous free tiers and very cheap scaling. Yes: its a lot of accounts, but its worth it. The best part here is with the exception of Ably and Clerk, everything here can be self-hosted. You can run Next on a node server, you can roll a SQLite/libSQL or Redis DB, and you can generate your own API Keys. You can move to an EC2 if needed, which makes this stack quite flexible.

## Why no testing?

I prefer building projects that have are easy to iterate on rather than relying on tests. That being said, tests can be added as shown in the [Next.js Documentation](https://nextjs.org/docs/pages/building-your-application/optimizing/testing).

## Contributing

Feel free to propose changes via PR. I'm not awfully picky about formatting right now, so I'll accept/reject on a case-by-case basis. Please make sure to have an issue first though.

## Stats

![Alt](https://repobeats.axiom.co/api/embed/e124419e3b2f4136d522277d0af700f200dfeada.svg "Repobeats analytics image")
