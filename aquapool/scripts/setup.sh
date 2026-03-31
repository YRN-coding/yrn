#!/usr/bin/env bash
# Aquapool — First-time developer setup script
set -e

echo "🌊 Setting up Aquapool development environment..."

# 1. Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js v20+ required. Current: $(node -v)"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# 3. Copy env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env from .env.example — fill in your API keys"
fi

# 4. Generate Prisma client
echo "🗄️  Generating Prisma client..."
cd packages/database && npm run db:generate && cd ../..

# 5. Start infrastructure
echo "🐳 Starting Docker infrastructure (Postgres, Redis, Kafka)..."
docker-compose up -d postgres redis kafka zookeeper

# 6. Wait for Postgres
echo "⏳ Waiting for Postgres..."
for i in {1..30}; do
  if docker-compose exec -T postgres pg_isready -U aquapool -d aquapool &>/dev/null; then
    echo "✅ Postgres ready"
    break
  fi
  sleep 2
done

# 7. Run database migrations
echo "🔄 Running database migrations..."
cd packages/database && npm run db:migrate && cd ../..

echo ""
echo "✅ Aquapool setup complete!"
echo ""
echo "Start development:"
echo "  npm run dev          # Start all services"
echo "  npm run docker:up    # Start infrastructure only"
echo "  npm run build        # Build all packages"
