#!/bin/bash

echo "Starting Staff Service Backend and Frontend..."
echo "Backend will run on http://localhost:8080"
echo "Frontend will run on http://localhost:4200"
echo ""

# Start backend in background
echo "Starting Backend (Spring Boot)..."
mvn spring-boot:run &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Start frontend (will run in foreground so we can see logs)
echo "Starting Frontend (Angular)..."
cd frontend
npm start

# Kill backend when frontend is stopped
trap "kill $BACKEND_PID" EXIT
