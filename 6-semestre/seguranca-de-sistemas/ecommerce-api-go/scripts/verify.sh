#!/bin/sh
# TEST_DATABASE_URL deve apontar a PostgreSQL descartável. Nunca use produção.
set -eu
cd "$(dirname "$0")/.."
go test ./... -count=1
go vet ./...
if [ "${VULN_SCAN:-0}" = 1 ]; then
    go run golang.org/x/vuln/cmd/govulncheck@v1.9.0 ./...
fi
# Race detector exige compilador C somente na máquina de teste, não no servidor.
if [ "${RACE:-0}" = 1 ]; then
    CGO_ENABLED=1 go test -race ./internal/middleware ./internal/server ./internal/loadtest
fi
