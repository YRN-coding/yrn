#!/usr/bin/env bash
# Aquapool — Build all packages and services
set -e

echo "🔨 Building Aquapool..."

# 1. Build shared package first (all services depend on it)
echo "  [1/4] Building @aquapool/shared..."
cd packages/shared && npm run build && cd ../..

# 2. Generate and build database package
echo "  [2/4] Building @aquapool/database..."
cd packages/database && npm run db:generate && npm run build && cd ../..

# 3. Build all services
echo "  [3/4] Building services..."
for svc in auth-service user-service wallet-service exchange-service \
            market-data-service remittance-service earn-service \
            compliance-service notification-service; do
  echo "    Building $svc..."
  cd "services/$svc" && npm run build && cd ../..
done

# 4. Build web app
echo "  [4/4] Building web app..."
cd apps/web && npm run build && cd ../..

echo ""
echo "✅ Build complete!"
