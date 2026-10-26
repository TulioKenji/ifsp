#!/bin/sh
# Executar com: sh scripts/setup-db.sh. Use o diretório do projeto, não o cwd do chamador.
set -eu
cd "$(dirname "$0")/.."
exec go run ./cmd/dbsetup "$@"
