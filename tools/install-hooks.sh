#!/usr/bin/env bash
# Wires the conformance checker as this repo's pre-commit hook (JUNE-563
# enforcement point 2a). Run once after cloning.
set -e
git config core.hooksPath tools
echo "core.hooksPath set to tools/ — 'tools/pre-commit' now runs on every commit."
