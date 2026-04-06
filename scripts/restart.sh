#!/bin/bash
set -e

# CFMS System Restart Script
# Stops and starts all services

echo "🔄 Restarting CFMS System..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Stopping services...${NC}"
./scripts/stop.sh

echo ""
echo -e "${YELLOW}Waiting 3 seconds before restart...${NC}"
sleep 3

echo ""
echo -e "${BLUE}Step 2: Starting services...${NC}"
./scripts/start.sh

echo ""
echo -e "${GREEN}✅ CFMS System restarted successfully!${NC}"