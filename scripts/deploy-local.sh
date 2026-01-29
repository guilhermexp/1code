#!/bin/bash
set -e

APP_NAME="1Code"
APP_PATH="/Applications/${APP_NAME}.app"
BUILD_OUTPUT="release/mac-arm64/${APP_NAME}.app"

echo "==> Closing ${APP_NAME} if running..."
osascript -e "quit app \"${APP_NAME}\"" 2>/dev/null || true
# Give it a moment to shut down gracefully
sleep 1
# Force kill if still running
pkill -f "${APP_PATH}/Contents/MacOS" 2>/dev/null || true
sleep 1

echo "==> Building TypeScript..."
bun run build

echo "==> Packaging for arm64 (dir only)..."
npx electron-builder --mac --arm64 --dir --config.mac.identity=null

echo "==> Replacing ${APP_PATH}..."
rm -rf "${APP_PATH}"
cp -R "${BUILD_OUTPUT}" "${APP_PATH}"

echo "==> Opening ${APP_NAME}..."
open "${APP_PATH}"

echo "==> Done!"
