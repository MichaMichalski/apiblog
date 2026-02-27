FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN mkdir -p prisma/data && npx prisma db push
RUN npm run build
RUN rm -f prisma/data/blog.db

FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma/schema.prisma prisma/schema.prisma
RUN npm ci --omit=dev
RUN npx prisma generate

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --home /home/nextjs --ingroup nodejs nextjs
ENV HOME=/home/nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/config ./src/config

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

RUN mkdir -p prisma/data public/uploads
RUN chown -R nextjs:nodejs prisma/data public/uploads src/config

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD node_modules/.bin/prisma migrate deploy && node server.js
