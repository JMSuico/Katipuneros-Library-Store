#!/bin/bash
set -e

if [ ! -f "$PGDATA/standby.signal" ]; then
    echo "Initializing replica standby from primary..."
    rm -rf "$PGDATA"/*
    PGPASSWORD="${POSTGRES_REPLICATION_PASSWORD:-KatipunerosReplPass_2026!}" pg_basebackup \
        -h katipuneros-db-primary \
        -p 5432 \
        -D "$PGDATA" \
        -U "${POSTGRES_REPLICATION_USER:-replicator}" \
        -Fp -Xs -R -v
    touch "$PGDATA/standby.signal"
    chmod 700 "$PGDATA"
    echo "Replica initialized with standby.signal."
fi
