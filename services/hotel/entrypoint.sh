#!/bin/sh
set -e

pnpm exec prisma migrate deploy
node dist/prisma/seed.js
exec node dist/src/main.js
