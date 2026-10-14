#!/usr/bin/env bash
set -euo pipefail

echo "==> Entorno Dev Container listo"
echo "    Node:            $(node -v)"
echo "    npm:             $(npm -v)"
echo "    create-next-app: $(create-next-app --version 2>/dev/null || echo 'instalado')"
echo ""

if [[ -f lista-espera/package.json ]]; then
  echo "==> Instalando dependencias del proyecto (npm install)..."
  npm install --prefix lista-espera
else
  echo "Aún no hay package.json. Cuando quieras crear la app: create-next-app@latest"
fi
