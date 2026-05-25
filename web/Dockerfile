FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* .
RUN npm ci

COPY . .
ARG BACKEND_BASE_URL=http://backend:8000
ENV BACKEND_BASE_URL=$BACKEND_BASE_URL
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN addgroup --system --gid 1001 nextjs \
    && adduser --system --uid 1001 --gid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV HOST=0.0.0.0 \
    PORT=3000 \
    NODE_ENV=production

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
