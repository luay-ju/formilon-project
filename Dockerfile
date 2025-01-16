FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts

# Copy Prisma and dependencies
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/typescript ./node_modules/typescript
COPY --from=builder /app/node_modules/ts-node ./node_modules/ts-node
COPY --from=builder /app/node_modules/@types ./node_modules/@types
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Create the entrypoint script with proper line endings
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'node -r ts-node/register /app/scripts/setup-database.ts' >> /app/entrypoint.sh && \
    echo 'node server.js' >> /app/entrypoint.sh

# Make scripts executable
RUN chmod +x /app/entrypoint.sh
RUN if [ -d "scripts" ]; then chmod +x ./scripts/*; fi

USER nextjs

EXPOSE 3000

# Use the entrypoint script directly
CMD ["/bin/sh", "/app/entrypoint.sh"]