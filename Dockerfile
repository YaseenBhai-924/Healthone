# Local / container Next.js (standalone output).
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time placeholders; runtime env is injected by compose.
ENV SITE_URL=http://localhost:3000
ENV API_BASE_URL=http://localhost:5200
ENV API_SCOPE=api://00000000-0000-0000-0000-000000000002/Requests.Access
ENV ENTRA_TENANT_ID=00000000-0000-0000-0000-000000000001
ENV ENTRA_CLIENT_ID=00000000-0000-0000-0000-000000000003
RUN pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
