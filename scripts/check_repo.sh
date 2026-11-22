#!/usr/bin/env bash
# ==============================================================================
# FieldOps - Verificação estática rápida de integridade do repositório
# Valida sintaxe de shell scripts, arquivos JSON e presença de artefatos base.
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/3] Validando sintaxe de scripts shell..."
for script in deploy_aws.sh scripts/check_repo.sh backend/mvnw; do
  if [[ -f "$script" ]]; then
    bash -n "$script"
    echo "  OK: $script"
  fi
done

echo "[2/3] Validando arquivos JSON..."
python3 - <<'PY'
import json, pathlib

json_files = [
    "frontend/package.json",
    "frontend/tsconfig.json",
    "frontend/.oxlintrc.json",
    "fieldops-mobile/package.json",
    "fieldops-mobile/app.json",
    "fieldops-mobile/eas.json",
    "fieldops-mobile/tsconfig.json",
    ".vscode/settings.json",
]

for rel in json_files:
    p = pathlib.Path(rel)
    if not p.exists():
        raise SystemExit(f"Arquivo ausente: {rel}")
    json.loads(p.read_text(encoding="utf-8"))
    print(f"  OK: {rel}")
PY

echo "[3/3] Verificando arquivos críticos de banco, compose e ambiente..."
for required in \
  "docker-compose.yml" \
  ".env.example" \
  "frontend/.env.example" \
  "database/schema.sql" \
  "database/seed.sql" \
  "backend/src/main/resources/db/migration/V1__initial_schema.sql" \
  "backend/src/main/resources/db/migration/V2__seed_data.sql"
do
  if [[ ! -f "$required" ]]; then
    echo "ERRO: arquivo obrigatório não encontrado: $required" >&2
    exit 1
  fi
  echo "  OK: $required"
done

echo "Verificação estática concluída com sucesso."
