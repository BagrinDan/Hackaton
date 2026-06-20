#!/bin/sh
set -e
echo "DATABASE_URL=$DATABASE_URL"
pnpm exec prisma migrate deploy --config prisma.config.ts
node dist/prisma/seed.js
exec node dist/src/main.js