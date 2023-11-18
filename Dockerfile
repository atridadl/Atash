# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.14.2
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=8.9.2
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Install node modules
COPY --link .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .

# Build application
RUN --mount=type=secret,id=NEXT_PUBLIC_APP_ENV \
    --mount=type=secret,id=APP_ENV \
    --mount=type=secret,id=ROOT_URL \
    --mount=type=secret,id=UPSTASH_RATELIMIT_SECONDS \
    --mount=type=secret,id=UPSTASH_RATELIMIT_REQUESTS \
    --mount=type=secret,id=UPSTASH_REDIS_EXPIRY_SECONDS \
    --mount=type=secret,id=UNKEY_ROOT_KEY \
    --mount=type=secret,id=CLERK_SECRET_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    --mount=type=secret,id=CLERK_WEBHOOK_SIGNING_SECRET \
    --mount=type=secret,id=NEXT_PUBLIC_CLERK_SIGN_IN_URL \
    --mount=type=secret,id=NEXT_PUBLIC_CLERK_SIGN_UP_URL \
    --mount=type=secret,id=ABLY_API_KEY \
    --mount=type=secret,id=DATABASE_AUTH_TOKEN \
    --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=UPSTASH_REDIS_REST_URL \
    --mount=type=secret,id=UPSTASH_REDIS_REST_TOKEN \
    NEXT_PUBLIC_APP_ENV="$(cat /run/secrets/NEXT_PUBLIC_APP_ENV)" \
    APP_ENV="$(cat /run/secrets/APP_ENV)" \
    ROOT_URL="$(cat /run/secrets/ROOT_URL)" \
    UPSTASH_RATELIMIT_SECONDS="$(cat /run/secrets/UPSTASH_RATELIMIT_SECONDS)" \
    UPSTASH_RATELIMIT_REQUESTS="$(cat /run/secrets/UPSTASH_RATELIMIT_REQUESTS)" \
    UPSTASH_REDIS_EXPIRY_SECONDS="$(cat /run/secrets/UPSTASH_REDIS_EXPIRY_SECONDS)" \
    UNKEY_ROOT_KEY="$(cat /run/secrets/UNKEY_ROOT_KEY)" \
    CLERK_SECRET_KEY="$(cat /run/secrets/CLERK_SECRET_KEY)" \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$(cat /run/secrets/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)" \
    CLERK_WEBHOOK_SIGNING_SECRET="$(cat /run/secrets/CLERK_WEBHOOK_SIGNING_SECRET)" \
    NEXT_PUBLIC_CLERK_SIGN_IN_URL="$(cat /run/secrets/NEXT_PUBLIC_CLERK_SIGN_IN_URL)" \
    NEXT_PUBLIC_CLERK_SIGN_UP_URL="$(cat /run/secrets/NEXT_PUBLIC_CLERK_SIGN_UP_URL)" \
    ABLY_API_KEY="$(cat /run/secrets/ABLY_API_KEY)" \
    DATABASE_AUTH_TOKEN="$(cat /run/secrets/DATABASE_AUTH_TOKEN)" \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" \
    UPSTASH_REDIS_REST_URL="$(cat /run/secrets/UPSTASH_REDIS_REST_URL)" \
    UPSTASH_REDIS_REST_TOKEN="$(cat /run/secrets/UPSTASH_REDIS_REST_TOKEN)" \
    pnpm run build

# Remove development dependencies
RUN pnpm prune --prod


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
