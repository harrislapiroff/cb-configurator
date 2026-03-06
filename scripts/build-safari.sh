#!/bin/bash
set -euo pipefail

# Load signing config from .env if present
if [ -f .env ]; then
	# shellcheck source=/dev/null
	. ./.env
fi

PROJ_DIR="safari/Caller's Box Configurator"
PBXPROJ="$PROJ_DIR/Caller's Box Configurator.xcodeproj/project.pbxproj"

# Generate the Xcode project from extension/ sources
xcrun safari-web-extension-packager extension/ \
	--project-location safari/ \
	--app-name "Caller's Box Configurator" \
	--bundle-identifier com.chromamine.callersboxconfigurator \
	--swift --no-open --no-prompt --force

# The packager escapes the apostrophe in "Caller's Box Configurator" as
# &apos; inside JS string literals assigned to .innerText in Script.js.
# The browser renders the raw entity characters on screen instead of an
# apostrophe, so fix it up.
SCRIPT_JS="$PROJ_DIR/Shared (App)/Resources/Script.js"
sed -i '' "s/&apos;/'/g" "$SCRIPT_JS"

# Patch in signing team if configured
if [ -n "${DEVELOPMENT_TEAM:-}" ]; then
	sed -i '' "s/CODE_SIGN_STYLE = Automatic;/CODE_SIGN_STYLE = Automatic; DEVELOPMENT_TEAM = $DEVELOPMENT_TEAM;/g" "$PBXPROJ"
	echo "Set DEVELOPMENT_TEAM=$DEVELOPMENT_TEAM in Xcode project"
else
	echo "No DEVELOPMENT_TEAM set — Xcode will default to no team (see .env)"
fi
