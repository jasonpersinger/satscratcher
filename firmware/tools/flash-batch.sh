#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "usage: $0 /dev/ttyUSB0 [/dev/ttyUSB1 ...]" >&2
  exit 2
fi

for port in "$@"; do
  echo "flashing $port"
  pio run -t upload --upload-port "$port"
done
