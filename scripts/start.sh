#!/bin/bash
set -e

# CFMS System Start Script
# Starts MySQL, Backend, and Frontend services

echo "🚀 Starting CFMS System..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to wait for service
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}Waiting for $service to be ready on port $port...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:$port >/dev/null 2>&1; then
            echo -e "${GREEN}$service is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}$service failed to start within $max_attempts seconds${NC}"
    return 1
}

# Function to wait for MySQL
wait_for_mysql() {
    echo -e "${YELLOW}Waiting for MySQL to be ready...${NC}"
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker exec cfms-mysql mysqladmin ping -h localhost --silent; then
            echo -e "${GREEN}MySQL is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}MySQL failed to start within $max_attempts seconds${NC}"
    return 1
}

# Create logs directory
mkdir -p logs

echo -e "${BLUE}Step 1: Starting MySQL Database...${NC}"
if docker ps | grep -q cfms-mysql; then
    echo -e "${YELLOW}MySQL container already running${NC}"
else
    docker-compose up -d mysql
    wait_for_mysql
fi

echo -e "${BLUE}Step 2: Starting Backend Server...${NC}"
if check_port 3002; then
    cd server
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Start backend in background
    nohup npm start > ../logs/backend.log 2>&1 &
    echo $! > ../logs/backend.pid
    cd ..
    
    wait_for_service 3002 "Backend API"
fi

echo -e "${BLUE}Step 3: Starting Frontend Development Server...${NC}"
if check_port 5173; then
    cd client
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start frontend in background
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    echo $! > ../logs/frontend.pid
    cd ..
    
    wait_for_service 5173 "Frontend"
fi

echo ""
echo -e "${GREEN}✅ CFMS System started successfully!${NC}"
echo ""
echo -e "${BLUE}Services running on:${NC}"
echo -e "  🌐 Frontend:  http://localhost:5173"
echo -e "  🔧 Backend:   http://localhost:3002"
echo -e "  🗄️  Database:  localhost:3306"
echo ""
echo -e "${YELLOW}Test Accounts:${NC}"
echo -e "  👤 Student: arjun@college.edu / password123"
echo -e "  👨‍💼 Admin:   ayush@college.edu / password123"
echo -e "  👩‍⚖️ Judge:   priya@judge.edu / password123"
echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo -e "  📊 View logs:  ./scripts/logs.sh"
echo -e "  🛑 Stop all:   ./scripts/stop.sh"
echo -e "  🔄 Restart:    ./scripts/restart.sh"
echo ""