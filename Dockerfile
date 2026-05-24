# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

# --- install dependencies ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- build the standalone server ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- minimal runtime image ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# geoip-lite loads its dataset from disk at runtime; the build tracer does not
# pick up the binary data files, so copy the whole package in explicitly.
COPY --from=deps /app/node_modules/geoip-lite ./node_modules/geoip-lite

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
