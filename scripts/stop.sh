#!/bin/bash
set -e

# CFMS System Stop Script
# Stops Frontend, Backend, and MySQL services

echo "🛑 Stopping CFMS System..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to stop process by PID file
stop_service() {
    local service=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat $pid_file)
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}Stopping $service (PID: $pid)...${NC}"
            kill $pid
            
            # Wait for process to stop
            local attempts=0
            while kill -0 $pid 2>/dev/null && [ $attempts -lt 10 ]; do
                sleep 1
                attempts=$((attempts + 1))
            done
            
            if kill -0 $pid 2>/dev/null; then
                echo -e "${RED}Force killing $service...${NC}"
                kill -9 $pid 2>/dev/null || true
            fi
            
            echo -e "${GREEN}$service stopped${NC}"
        else
            echo -e "${YELLOW}$service not running${NC}"
        fi
        rm -f $pid_file
    else
        echo -e "${YELLOW}$service PID file not found${NC}"
    fi
}

# Function to stop processes by port
stop_by_port() {
    local port=$1
    local service=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}Stopping $service processes on port $port...${NC}"
        echo $pids | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}$service stopped${NC}"
    else
        echo -e "${YELLOW}No $service processes running on port $port${NC}"
    fi
}

echo -e "${BLUE}Step 1: Stopping Frontend...${NC}"
stop_service "Frontend" "logs/frontend.pid"
stop_by_port 5173 "Frontend"

echo -e "${BLUE}Step 2: Stopping Backend...${NC}"
stop_service "Backend" "logs/backend.pid"
stop_by_port 3002 "Backend"

echo -e "${BLUE}Step 3: Stopping MySQL Database...${NC}"
if docker ps | grep -q cfms-mysql; then
    docker-compose stop mysql
    echo -e "${GREEN}MySQL container stopped${NC}"
else
    echo -e "${YELLOW}MySQL container not running${NC}"
fi

# Clean up log files
echo -e "${BLUE}Cleaning up...${NC}"
mkdir -p logs
> logs/backend.log 2>/dev/null || true
> logs/frontend.log 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ CFMS System stopped successfully!${NC}"
echo ""
echo -e "${BLUE}To start again:${NC} ./scripts/start.sh"
echo ""