#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Pax Mentis — GitHub Sync Script
#  Replit'teki son hali GitHub'a push eder.
#
#  Kullanım:
#    bash scripts/github-sync.sh
#    bash scripts/github-sync.sh "özel commit mesajı"
# ─────────────────────────────────────────────────────────────

set -e

GITHUB_USER="mehmetrts"
GITHUB_REPO="pax-mentis-app"
BRANCH="main"

# Token: ortam değişkeninden al (Replit Secrets'tan gelir)
TOKEN="${GITHUB_TOKEN}"
if [ -z "$TOKEN" ]; then
  echo "❌ GITHUB_TOKEN ortam değişkeni tanımlı değil."
  echo "   Replit Secrets'a ekleyin ya da export GITHUB_TOKEN=ghp_... yapın."
  exit 1
fi

REMOTE_URL="https://${GITHUB_USER}:${TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

# Git ayarları
git config user.email "pax-mentis@replit.com" 2>/dev/null || true
git config user.name  "Pax Mentis Replit"     2>/dev/null || true

# Remote yoksa ekle, varsa güncelle
if git remote get-url github-pax &>/dev/null; then
  git remote set-url github-pax "$REMOTE_URL"
else
  git remote add github-pax "$REMOTE_URL"
fi

# Commit mesajı
MSG="${1:-"sync: $(date '+%Y-%m-%d %H:%M')"}"

# Stage + commit (değişiklik yoksa atla)
git add -A
if git diff --cached --quiet; then
  echo "✅ Yeni değişiklik yok — push atlandı."
else
  git commit -m "$MSG"
  echo "📝 Commit: $MSG"
fi

# Push
git push github-pax HEAD:"$BRANCH"
echo "🚀 GitHub'a push edildi: https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
