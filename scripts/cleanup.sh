#!/bin/bash
echo "Cleaning up..."
docker stop backend frontend 2>/dev/null || true
docker rm backend frontend 2>/dev/null || true
echo "Cleanup complete! Database & monitoring still running."