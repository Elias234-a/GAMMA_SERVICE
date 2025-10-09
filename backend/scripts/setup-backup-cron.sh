#!/bin/bash
# Setup Backup Cron Job (Linux/Mac)
# Configura backup automático diario a las 2:00 AM

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
CRON_JOB="0 2 * * * cd $BACKEND_DIR && node scripts/backup-mongodb.js >> logs/backup-cron.log 2>&1"

echo "==============================================="
echo "  Setup Backup Cron Job - GAMMA Service ERP"
echo "==============================================="
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-mongodb.js"; then
    echo "[INFO] Backup cron job already exists"
    echo ""
    echo "Current cron jobs:"
    crontab -l | grep "backup-mongodb.js"
    echo ""
    read -p "Do you want to replace it? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "[INFO] Setup cancelled"
        exit 0
    fi
    
    # Remove existing cron job
    crontab -l | grep -v "backup-mongodb.js" | crontab -
    echo "[INFO] Removed existing cron job"
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "[SUCCESS] Backup cron job added successfully!"
echo ""
echo "Schedule: Daily at 2:00 AM"
echo "Log file: $BACKEND_DIR/logs/backup-cron.log"
echo ""
echo "To view all cron jobs: crontab -l"
echo "To remove this cron job: crontab -e (and delete the line)"
echo ""
echo "==============================================="
