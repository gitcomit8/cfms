#!/bin/bash

# CFMS System Logs Script
# Streams logs from all services

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${BLUE}CFMS Log Viewer${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ./scripts/logs.sh [service] [options]"
    echo ""
    echo -e "${YELLOW}Services:${NC}"
    echo -e "  all       - All services (default)"
    echo -e "  frontend  - Frontend development server"
    echo -e "  backend   - Backend API server"
    echo -e "  mysql     - MySQL database"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo -e "  -f, --follow   - Follow log output (like tail -f)"
    echo -e "  -n, --lines N  - Show last N lines (default: 50)"
    echo -e "  -h, --help     - Show this help"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ./scripts/logs.sh                    # Show recent logs from all services"
    echo -e "  ./scripts/logs.sh -f                 # Follow all logs"
    echo -e "  ./scripts/logs.sh backend -f         # Follow backend logs only"
    echo -e "  ./scripts/logs.sh frontend -n 100    # Show last 100 frontend log lines"
    echo ""
}

# Default values
SERVICE="all"
FOLLOW=false
LINES=50

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        all|frontend|backend|mysql)
            SERVICE="$1"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to check if service is running
check_service_status() {
    echo -e "${CYAN}=== Service Status ===${NC}"
    
    # Check Frontend
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend (Port 5173): Running${NC}"
    else
        echo -e "${RED}❌ Frontend (Port 5173): Not running${NC}"
    fi
    
    # Check Backend
    if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend (Port 3002): Running${NC}"
    else
        echo -e "${RED}❌ Backend (Port 3002): Not running${NC}"
    fi
    
    # Check MySQL
    if docker ps | grep -q cfms-mysql; then
        echo -e "${GREEN}✅ MySQL (Docker): Running${NC}"
    else
        echo -e "${RED}❌ MySQL (Docker): Not running${NC}"
    fi
    
    echo ""
}

# Function to show frontend logs
show_frontend_logs() {
    echo -e "${BLUE}=== Frontend Logs ===${NC}"
    if [ -f "logs/frontend.log" ]; then
        if [ "$FOLLOW" = true ]; then
            tail -f logs/frontend.log | sed "s/^/$(echo -e "${CYAN}[FRONTEND]${NC}") /"
        else
            tail -n $LINES logs/frontend.log | sed "s/^/$(echo -e "${CYAN}[FRONTEND]${NC}") /"
        fi
    else
        echo -e "${YELLOW}No frontend logs found${NC}"
    fi
}

# Function to show backend logs
show_backend_logs() {
    echo -e "${BLUE}=== Backend Logs ===${NC}"
    if [ -f "logs/backend.log" ]; then
        if [ "$FOLLOW" = true ]; then
            tail -f logs/backend.log | sed "s/^/$(echo -e "${GREEN}[BACKEND]${NC}") /"
        else
            tail -n $LINES logs/backend.log | sed "s/^/$(echo -e "${GREEN}[BACKEND]${NC}") /"
        fi
    else
        echo -e "${YELLOW}No backend logs found${NC}"
    fi
}

# Function to show MySQL logs
show_mysql_logs() {
    echo -e "${BLUE}=== MySQL Logs ===${NC}"
    if docker ps | grep -q cfms-mysql; then
        if [ "$FOLLOW" = true ]; then
            docker logs -f cfms-mysql 2>&1 | sed "s/^/$(echo -e "${YELLOW}[MYSQL]${NC}") /"
        else
            docker logs --tail $LINES cfms-mysql 2>&1 | sed "s/^/$(echo -e "${YELLOW}[MYSQL]${NC}") /"
        fi
    else
        echo -e "${RED}MySQL container not running${NC}"
    fi
}

# Function to show all logs
show_all_logs() {
    if [ "$FOLLOW" = true ]; then
        echo -e "${BLUE}Following all logs... (Press Ctrl+C to stop)${NC}"
        echo ""
        
        # Start background processes for each service
        mkfifo /tmp/cfms-logs 2>/dev/null || true
        
        # Background log followers
        if [ -f "logs/frontend.log" ]; then
            tail -f logs/frontend.log | sed "s/^/$(echo -e "${CYAN}[FRONTEND]${NC}") /" >> /tmp/cfms-logs &
            FRONTEND_PID=$!
        fi
        
        if [ -f "logs/backend.log" ]; then
            tail -f logs/backend.log | sed "s/^/$(echo -e "${GREEN}[BACKEND]${NC}") /" >> /tmp/cfms-logs &
            BACKEND_PID=$!
        fi
        
        if docker ps | grep -q cfms-mysql; then
            docker logs -f cfms-mysql 2>&1 | sed "s/^/$(echo -e "${YELLOW}[MYSQL]${NC}") /" >> /tmp/cfms-logs &
            MYSQL_PID=$!
        fi
        
        # Read from the named pipe
        cat /tmp/cfms-logs &
        CAT_PID=$!
        
        # Cleanup function
        cleanup() {
            echo -e "\n${YELLOW}Stopping log streaming...${NC}"
            kill $FRONTEND_PID 2>/dev/null || true
            kill $BACKEND_PID 2>/dev/null || true
            kill $MYSQL_PID 2>/dev/null || true
            kill $CAT_PID 2>/dev/null || true
            rm -f /tmp/cfms-logs
            exit 0
        }
        
        # Set trap for cleanup
        trap cleanup INT TERM
        
        # Wait
        wait
    else
        show_frontend_logs
        echo ""
        show_backend_logs
        echo ""
        show_mysql_logs
    fi
}

# Main execution
echo -e "${BLUE}CFMS System Logs${NC}"
echo ""

check_service_status

case $SERVICE in
    frontend)
        show_frontend_logs
        ;;
    backend)
        show_backend_logs
        ;;
    mysql)
        show_mysql_logs
        ;;
    all)
        show_all_logs
        ;;
esac