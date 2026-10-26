#!/bin/sh
# Build Linux puro Go; sem dependência de libc/CGO ou Docker no destino.
set -eu
cd "$(dirname "$0")/.."
export CGO_ENABLED=0
export GOOS="${GOOS:-linux}"
export GOARCH="${GOARCH:-amd64}"
out="${BUILD_OUT:-dist-server}"
if [ ! -f ../ecommerce-front-spa/dist/index.html ]; then
    echo 'Compile o SPA antes: cd ../ecommerce-front-spa && npm ci && npm run build' >&2
    exit 1
fi
mkdir -p "$out/spa"
go build -trimpath -ldflags='-s -w' -o "$out/greenstore" .
go build -trimpath -ldflags='-s -w' -o "$out/dbsetup" ./cmd/dbsetup
go build -trimpath -ldflags='-s -w' -o "$out/keygen" ./cmd/keygen
go build -trimpath -ldflags='-s -w' -o "$out/stress" ./cmd/stress
cp -R ../ecommerce-front-spa/dist/. "$out/spa/"
cp -R deploy "$out/"
cp -R docs "$out/"
printf 'Artefatos %s/%s em %s\n' "$GOOS" "$GOARCH" "$out"
