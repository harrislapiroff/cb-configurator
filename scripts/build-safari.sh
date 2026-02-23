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

# Fix HTML entity escaping introduced by the packager
find safari/ -type f \( \
	-name '*.swift' -o -name '*.html' -o -name '*.plist' \
	-o -name '*.storyboard' -o -name '*.xib' -o -name '*.strings' \
\) -exec sed -i '' "s/&apos;/'/g" {} +

# Patch in signing team if configured
if [ -n "${DEVELOPMENT_TEAM:-}" ]; then
	sed -i '' "s/CODE_SIGN_STYLE = Automatic;/CODE_SIGN_STYLE = Automatic; DEVELOPMENT_TEAM = $DEVELOPMENT_TEAM;/g" "$PBXPROJ"
	echo "Set DEVELOPMENT_TEAM=$DEVELOPMENT_TEAM in Xcode project"
else
	echo "No DEVELOPMENT_TEAM set — Xcode will default to no team (see .env)"
fi
