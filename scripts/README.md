# CFMS Management Scripts

This directory contains scripts to manage the CFMS system services.

## Scripts

### 🚀 `start.sh` - Start all services
```bash
./scripts/start.sh
```
- Starts MySQL Docker container
- Starts Express backend server (port 3002)
- Starts Vite frontend dev server (port 5173)
- Automatically installs dependencies if needed
- Waits for services to be ready before continuing

### 🛑 `stop.sh` - Stop all services  
```bash
./scripts/stop.sh
```
- Gracefully stops frontend and backend processes
- Stops MySQL Docker container
- Cleans up PID files and log files

### 📊 `logs.sh` - View and follow logs
```bash
# View recent logs from all services
./scripts/logs.sh

# Follow all logs in real-time
./scripts/logs.sh -f

# View specific service logs
./scripts/logs.sh frontend -f
./scripts/logs.sh backend -n 100
./scripts/logs.sh mysql

# Help
./scripts/logs.sh --help
```

### 🔄 `restart.sh` - Restart all services
```bash
./scripts/restart.sh
```
- Stops all services
- Waits 3 seconds
- Starts all services

### 📋 `status.sh` - Check system status
```bash
./scripts/status.sh
```
- Shows detailed status of all services
- Resource usage information  
- Network connectivity tests
- Recent log activity
- Process information (PID, memory, CPU)

## Usage Examples

```bash
# Start the system
./scripts/start.sh

# Check if everything is running
./scripts/status.sh

# Follow logs while using the system
./scripts/logs.sh -f

# Restart if needed
./scripts/restart.sh

# Stop when done
./scripts/stop.sh
```

## Log Files

Logs are stored in the `logs/` directory:
- `backend.log` - Express server logs
- `frontend.log` - Vite development server logs  
- `backend.pid` - Backend process ID
- `frontend.pid` - Frontend process ID

## Service Ports

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002  
- **MySQL Database**: localhost:3306

## Error Handling

The scripts include:
- Port conflict detection
- Service readiness checks
- Graceful shutdown handling
- Automatic dependency installation
- Process cleanup on script interruption