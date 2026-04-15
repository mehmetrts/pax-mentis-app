#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Pax Mentis — Local Android Build Script
#  Samsung S23 Ultra'ya APK yükler.
#
#  ÖN KOŞULLAR:
#    - Android Studio kurulu
#    - ANDROID_HOME ayarlı (Android SDK yüklü)
#    - Java 17+ kurulu
#    - Samsung S23 Ultra USB bağlı + USB Hata Ayıklama açık
#
#  KULLANIM:
#    bash scripts/local-android-build.sh
# ─────────────────────────────────────────────────────────────

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$REPO_ROOT/artifacts/pax-mentis"

echo "📦 1. Bağımlılıklar yükleniyor..."
cd "$REPO_ROOT"
pnpm install

echo "🤖 2. Android'e build + yükleme başlıyor..."
cd "$APP_DIR"
npx expo run:android --device

echo "✅ Tamamlandı! Uygulama Samsung S23 Ultra'ya yüklendi."
