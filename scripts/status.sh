#!/bin/bash

# CFMS System Status Script
# Shows detailed status of all services

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}CFMS System Status${NC}"
echo -e "${BLUE}==================${NC}"
echo ""

# Function to check port and get PID
check_port_status() {
    local port=$1
    local service=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null || echo "")
    
    if [ ! -z "$pid" ]; then
        local cmd=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
        local memory=$(ps -p $pid -o rss= 2>/dev/null | awk '{printf "%.1f MB", $1/1024}' || echo "N/A")
        local cpu=$(ps -p $pid -o %cpu= 2>/dev/null || echo "N/A")
        
        echo -e "${GREEN}✅ $service${NC}"
        echo -e "   Port: $port | PID: $pid | Process: $cmd"
        echo -e "   Memory: $memory | CPU: ${cpu}%"
        
        # Check if service is responsive
        if curl -s --max-time 2 http://localhost:$port >/dev/null 2>&1; then
            echo -e "   ${GREEN}Status: Responsive${NC}"
        else
            echo -e "   ${YELLOW}Status: Running but not responsive${NC}"
        fi
    else
        echo -e "${RED}❌ $service${NC}"
        echo -e "   Port: $port | Status: Not running"
    fi
    echo ""
}

# Function to check Docker container
check_docker_status() {
    local container=$1
    local service=$2
    
    if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q $container; then
        local status=$(docker ps --filter "name=$container" --format "{{.Status}}")
        local ports=$(docker ps --filter "name=$container" --format "{{.Ports}}")
        
        echo -e "${GREEN}✅ $service (Docker)${NC}"
        echo -e "   Container: $container"
        echo -e "   Status: $status"
        echo -e "   Ports: $ports"
        
        # Check MySQL connectivity
        if docker exec $container mysqladmin ping -h localhost --silent 2>/dev/null; then
            echo -e "   ${GREEN}MySQL: Connected${NC}"
        else
            echo -e "   ${YELLOW}MySQL: Connection issues${NC}"
        fi
    else
        echo -e "${RED}❌ $service (Docker)${NC}"
        echo -e "   Container: $container | Status: Not running"
    fi
    echo ""
}

# Function to show disk usage
show_disk_usage() {
    echo -e "${CYAN}📊 Resource Usage${NC}"
    echo -e "${CYAN}=================${NC}"
    
    # Node modules size
    local client_nm_size=$(du -sh client/node_modules 2>/dev/null | cut -f1 || echo "N/A")
    local server_nm_size=$(du -sh server/node_modules 2>/dev/null | cut -f1 || echo "N/A")
    
    echo -e "Frontend node_modules: $client_nm_size"
    echo -e "Backend node_modules: $server_nm_size"
    
    # Log files size
    local log_size=$(du -sh logs 2>/dev/null | cut -f1 || echo "N/A")
    echo -e "Log files: $log_size"
    
    # Docker volume size
    if docker volume ls | grep -q cfms; then
        local docker_size=$(docker system df -v | grep cfms || echo "Volume info not available")
        echo -e "Docker volumes: Available in 'docker system df'"
    fi
    
    echo ""
}

# Function to show recent activity
show_recent_activity() {
    echo -e "${CYAN}📈 Recent Activity${NC}"
    echo -e "${CYAN}=================${NC}"
    
    # Recent frontend log entries
    if [ -f "logs/frontend.log" ]; then
        echo -e "${BLUE}Frontend (last 3 lines):${NC}"
        tail -n 3 logs/frontend.log | sed 's/^/  /'
    fi
    
    # Recent backend log entries
    if [ -f "logs/backend.log" ]; then
        echo -e "${BLUE}Backend (last 3 lines):${NC}"
        tail -n 3 logs/backend.log | sed 's/^/  /'
    fi
    
    # MySQL logs
    if docker ps | grep -q cfms-mysql; then
        echo -e "${BLUE}MySQL (last 3 lines):${NC}"
        docker logs --tail 3 cfms-mysql 2>&1 | sed 's/^/  /'
    fi
    
    echo ""
}

# Function to show network info
show_network_info() {
    echo -e "${CYAN}🌐 Network Information${NC}"
    echo -e "${CYAN}=====================${NC}"
    
    echo -e "Frontend URL: ${BLUE}http://localhost:5173${NC}"
    echo -e "Backend API:  ${BLUE}http://localhost:3002${NC}"
    echo -e "MySQL Port:   ${BLUE}localhost:3306${NC}"
    echo ""
    
    # Test connectivity
    echo -e "Connectivity Tests:"
    
    if curl -s --max-time 2 http://localhost:5173 >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Frontend reachable${NC}"
    else
        echo -e "  ${RED}❌ Frontend not reachable${NC}"
    fi
    
    if curl -s --max-time 2 http://localhost:3002/api/health >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Backend API reachable${NC}"
    else
        echo -e "  ${RED}❌ Backend API not reachable${NC}"
    fi
    
    if docker exec cfms-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo -e "  ${GREEN}✅ MySQL database reachable${NC}"
    else
        echo -e "  ${RED}❌ MySQL database not reachable${NC}"
    fi
    
    echo ""
}

# Main status checks
echo -e "${YELLOW}🔍 Service Status${NC}"
echo -e "${YELLOW}================${NC}"

check_port_status 5173 "Frontend (Vite Dev Server)"
check_port_status 3002 "Backend (Express API)"
check_docker_status "cfms-mysql" "MySQL Database"

show_network_info
show_disk_usage
show_recent_activity

echo -e "${BLUE}Management Commands:${NC}"
echo -e "  🚀 Start:    ./scripts/start.sh"
echo -e "  🛑 Stop:     ./scripts/stop.sh" 
echo -e "  🔄 Restart:  ./scripts/restart.sh"
echo -e "  📊 Logs:     ./scripts/logs.sh"
echo ""