#!/bin/bash
cd "$(dirname "$0")"
npx prisma migrate dev --name add_import_and_ai_features