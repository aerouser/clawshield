#!/bin/bash
# Logger de uso do ClawShield
# Adiciona entrada ao log sempre que usado

LOG_FILE="/root/.openclaw/workspace/logs/clawshield-usage.log"
SKILL_NAME="$1"
STATUS="$2"
SCORE="$3"
FORCE_FLAG="$4"

echo "[$(date -Iseconds)] skill=$SKILL_NAME status=$STATUS score=$SCORE force=$FORCE_FLAG" >> "$LOG_FILE"
