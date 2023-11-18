![Atash Logo](https://github.com/atridadl/Atash/assets/88056492/620d2d1a-1862-42ce-bbe3-75fb640abbf2)

# Atash (آتش)

The 🔥hottest🔥 full-stack Next.js template!

Atash (آتش) is Persian or Farsi for Fire! Pronounced "Ahh-tash".

## Features

- 🔥 User Auth, API Auth, and Orgs!
- 🔥 Caching and Rate Limiting!
- 🔥 Fast queries with Drizzle!
- 🔥 Next.js App Router!
- 🔥 Customizable Themes
- 🔥 100% free and open-source... forever!

## Stack

- Front-end framework: Nextjs
- Front-end library: React
- Rendering method: SSR SPA
- Hosting: Fly.io
- Real-time pub/sub: Ably
- ORM: Drizzle ORM
- Auth: Clerk
- API Key Management: Unkey
- Database: Turso (Edge libSQL)
- Database Cache: Upstash (Redis)
- CSS: TailwindCSS + DaisyUI

## Instructions

- First set up accounts on Fly.io, Turso, Clerk, Unkey, Upstash, and Ably
- Create projects on all of those services
- Run the `pnpm init:env` command to generate a .env file to fill out
- Ensure that the webhook url https://DOMAIN.TLD/api/webhooks is added with the user.created and user.deleted events
- You will need up a webhook to point to https://<domain.tld>/api/webhooks, and ensure you use the "Signing Secret" from the webhook as your CLERK_WEBHOOK_SIGNING_SECRET environment variable...
- For the Headers: please generate an Unkey key and pass it in the headers as a Bearer token for the webhook

## Styling

The tailwind.config.js file will contain a list of themes that are added by default. To change the theme, change the value of "data-theme" on the html tag in src/app/layout.tsx. For more information on DaisyUI themes, please see their [documentation](https://daisyui.com/docs/themes/).

## Contributing

Feel free to propose changes via PR. I'm not awfully picky about formatting right now, so I'll accept/reject on a case-by-case basis. Please make sure to have an issue first though.
