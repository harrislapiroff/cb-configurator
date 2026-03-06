# Caller's Box Configurator

A browser extension (Manifest V3) that replaces gendered dance terminology on
the [Caller's Box](https://www.ibiblio.org/contradance/thecallersbox/) contra
dance choreography website with gender-neutral alternatives.

## Project Structure

```
extension/           # All extension source files (loaded directly, no build step)
  content-script.js  # Content script entry point (thin loader, dynamically imports main.js)
  manifest.json      # MV3 manifest — defines content scripts, permissions, icons
  maps.js            # Term mapping constants (ES module, exports Map objects)
  main.js            # Core logic module (ES module, imports maps.js, exports functions)
  options.html       # Settings popup / options page UI
  options.js         # Web Component for the settings form
  icons/             # Extension icons (48, 96, 128 px)
tests/               # Automated tests (node:test + jsdom)
eslint.config.mjs    # ESLint flat config
```

There is no build system or bundler. The extension source lives in `extension/`
and is loaded directly. `content-script.js` is a thin classic-script entry
point that dynamically imports `main.js` as an ES module (browsers don't
support static ES module imports in content scripts). `main.js` then uses
standard static `import`/`export` with `maps.js`. `web-ext` is used for
running in Firefox and packaging for distribution.

## How It Works

1. `maps.js` exports `Map` constants for terminology substitutions (e.g.,
   `RSR_TERMS`, `ROLE_TERMS_BIRDS`, `ROLE_TERMS_LF`).
2. `content-script.js` is the manifest-declared content script entry point. It
   dynamically imports `main.js` as an ES module.
3. `main.js` imports the term maps from `maps.js`, reads user preferences from
   `browser.storage.sync`, then performs DOM text replacements.
4. `options.js` defines a `<cb-options-form>` custom element that persists
   settings to `browser.storage.sync`. The options page doubles as the popup.

## Development

### Setup

```sh
npm install
```

### Running in Firefox

```sh
npm start
```

This uses `web-ext run` to launch Firefox with the extension loaded. It
auto-reloads on file changes.

### Loading manually

- **Chrome:** Go to `chrome://extensions`, enable Developer Mode, click
  "Load unpacked", and select the `extension/` directory.
- **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click
  "Load Temporary Add-on", and select `extension/manifest.json`.

### Linting

```sh
npm run lint        # ESLint + web-ext lint (run both)
npm run lint:js     # ESLint only
npm run lint:ext    # web-ext lint only (manifest validation)
```

### Building for distribution

```sh
npm run build
```

This creates a `.zip` in `web-ext-artifacts/`.

### Code style

- Tab indentation (see `.editorconfig`)
- LF line endings
- Vanilla JS (ES modules), no frameworks or transpilation
- Cross-browser: uses `chrome`/`browser` API abstraction

### Testing

```sh
npm test
```

Tests use Node.js built-in test runner (`node:test`) with jsdom for DOM
simulation. They cover the term maps, all replacement functions, and manifest
validation (including checks that content scripts don't use unsupported
`"type": "module"` or static `import` syntax).

Also test manually by loading the extension and visiting a Caller's Box dance
page such as:
https://www.ibiblio.org/contradance/thecallersbox/dance.php?id=7868

## Publishing

### Build artifacts

`npm run build` uses `web-ext build` to create a `.zip` in `web-ext-artifacts/`.
This zip is suitable for submission to Firefox, Chrome, and Edge — all three
expect the same Manifest V3 zip format.

For Safari, Apple requires a separate native app wrapper; see the
[Safari](#safari-mac-app-store) section below.

### Firefox (Mozilla Add-ons)

1. Run `npm run build` to produce `web-ext-artifacts/cb_configurator-<version>.zip`
2. Log in at <https://addons.mozilla.org/en-US/developers/>
3. Open your extension listing and click **Upload New Version**, or click
   **Submit a New Add-on** for a first submission
4. Upload the `.zip`
5. When asked whether a build step is required: select **No** — all source files
   are plain, unminified JS loaded directly from the zip. AMO's automated review
   should pass without further action, but a human reviewer may still request
   the source. If so, submit a zip of the repository root (excluding
   `node_modules/` and `web-ext-artifacts/`)
6. Complete the listing details and submit

The extension's stable ID (`callersboxconfigurator@chromamine.com`) is set in
`manifest.json` under `browser_specific_settings.gecko.id`, which prevents
Firefox from assigning a random ID on each install.

### Chrome (Chrome Web Store)

1. Run `npm run build` to produce `web-ext-artifacts/cb_configurator-<version>.zip`
2. Log in at <https://chrome.google.com/webstore/devconsole/>
   — a one-time $5 developer registration fee is required for new accounts
3. Click **New Item** (or open your existing listing and choose
   **Package → Upload new package**)
4. Upload the `.zip`
5. Add store listing assets (screenshots, description, etc.) and submit for review
   — automated review typically completes within a few days

The `browser_specific_settings.gecko` key in `manifest.json` is Firefox-only;
Chrome silently ignores unknown manifest keys, so no manifest changes are needed
for a Chrome submission.

### Edge (Microsoft Edge Add-ons)

Edge uses the same Chromium extension format as Chrome, so the same `.zip` works
without modification.

1. Run `npm run build` to produce `web-ext-artifacts/cb_configurator-<version>.zip`
2. Log in at <https://partner.microsoft.com/dashboard/microsoftedge/overview>
   — a free Microsoft account is all that's required; no registration fee
3. Click **Create new extension**
4. Upload the `.zip`
5. Complete the listing and submit for certification

### Safari (Mac App Store & iOS App Store)

Safari extensions must be wrapped in a native app and distributed through the
App Store. This requires **macOS**, **Xcode**, and an **Apple Developer
account** ($99/year). Safari on iOS/iPadOS 15+ and macOS 14+ support MV3
extensions.

**Convert the extension (macOS only):**

```sh
npm run build:safari
```

This runs Apple's `xcrun safari-web-extension-packager` on the `extension/`
directory and writes an Xcode project to `safari/`. The generated project
includes targets for both **macOS** and **iOS/iPadOS** — no separate script is
needed for mobile.

`safari/` is listed in `.gitignore` and treated as a build artifact like
`web-ext-artifacts/`. Run `npm run build:safari` whenever you need to produce
or refresh it. The Xcode project references extension source files from
`extension/` via relative paths rather than copying them, so edits to the
extension are reflected immediately without re-running the packager.

**Configure the Xcode project:**

1. Open `safari/Caller's Box Configurator/Caller's Box Configurator.xcodeproj`
2. In the project editor select each app target (macOS and iOS), then under
   **Signing & Capabilities** set your **Team**
3. Confirm the **Bundle Identifier** (`com.chromamine.callersboxconfigurator`)
   and **Version** match the extension

**Test locally on macOS:**

1. Select the macOS scheme and choose Product → Run
2. In Safari, go to **Settings → Extensions** and enable *Caller's Box
   Configurator*
3. Visit a Caller's Box dance page and verify the substitutions work

**Test locally on iOS/iPadOS:**

1. Select the iOS scheme, then choose a Simulator or connected device
2. Choose Product → Run to install the wrapper app
3. On the device, go to **Settings → Safari → Extensions** and enable *Caller's
   Box Configurator*
4. In Safari, visit a Caller's Box dance page and verify the substitutions work

**Submit to the Mac App Store:**

1. Select the macOS scheme, then Product → Archive
2. In the Xcode Organizer, choose **Distribute App → App Store Connect**
3. Complete the App Store Connect listing (name, description, screenshots,
   pricing — free, category: Utilities or Productivity)
4. Submit for review

**Submit to the iOS App Store:**

The iOS and macOS apps are submitted as separate App Store listings, each with
its own App Store Connect entry.

1. Select the iOS scheme, then Product → Archive
2. In the Xcode Organizer, choose **Distribute App → App Store Connect**
3. Create a new listing in App Store Connect for the iOS app (or reuse the
   macOS listing's App Store Connect page if you want a Universal Purchase)
4. Add iOS-specific screenshots and metadata and submit for review

Apple's review for Safari extensions typically asks for a written explanation of
what the extension does and why it requests each permission — prepare a brief
reviewer note.

### Automated publishing (GitHub Actions)

The `publish.yml` workflow automatically submits the extension to Chrome,
Firefox, and Edge whenever a GitHub release is published. It uses
[publish-browser-extension](https://github.com/aklinker1/publish-browser-extension)
to handle uploads to all three stores.

**How it works:**

1. Creating a GitHub release triggers the workflow
2. Lint and tests run first — publishing is blocked if they fail
3. `web-ext build` produces the `.zip`
4. The zip is submitted to every store whose secrets are configured; stores
   without credentials are silently skipped

**Required GitHub Actions secrets:**

Configure these in **Settings → Secrets and variables → Actions** on the
repository. Only set secrets for stores you want to publish to — unconfigured
stores are skipped automatically.

| Store | Secret | Description |
|-------|--------|-------------|
| Chrome | `CHROME_EXTENSION_ID` | Extension ID from the Chrome Web Store dashboard |
| Chrome | `CHROME_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console |
| Chrome | `CHROME_CLIENT_SECRET` | OAuth 2.0 client secret |
| Chrome | `CHROME_REFRESH_TOKEN` | OAuth 2.0 refresh token (see setup below) |
| Firefox | `FIREFOX_EXTENSION_ID` | Add-on ID (e.g. `callersboxconfigurator@chromamine.com`) |
| Firefox | `FIREFOX_JWT_ISSUER` | API key (issuer) from AMO Developer Hub |
| Firefox | `FIREFOX_JWT_SECRET` | API secret from AMO Developer Hub |
| Edge | `EDGE_PRODUCT_ID` | Product ID from Partner Center |
| Edge | `EDGE_CLIENT_ID` | API client ID from Partner Center |
| Edge | `EDGE_API_KEY` | API client secret from Partner Center |

**Initial setup per store:**

Each store requires a one-time manual first submission before automated updates
will work. After the first submission, the workflow handles subsequent versions.

- **Chrome:** Create a Google Cloud project, enable the Chrome Web Store API,
  create an OAuth 2.0 Desktop client, and exchange an authorization code for a
  refresh token. See the
  [Chrome Web Store API docs](https://developer.chrome.com/docs/webstore/using-api).
- **Firefox:** Generate API credentials at
  <https://addons.mozilla.org/en-US/developers/addon/api/key/>. Listed
  extensions enter a review queue after upload — this is expected and not a
  failure.
- **Edge:** Generate API credentials under "Publish API" in
  [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview).
  Credentials expire after 2 years.

**Creating a release:**

```sh
# 1. Update version in manifest.json and package.json
# 2. Commit, tag, and push
git tag v0.3
git push origin main --tags
# 3. Create a GitHub release for the tag (via UI or gh CLI)
gh release create v0.3 --generate-notes
```

Safari is not included in the automated workflow because it requires macOS
runners and Apple code signing. Continue using the manual process described
above for Safari submissions.

### Other browsers

- **Brave**: Uses the Chrome Web Store directly — install the Chrome version,
  no separate Brave submission needed
- **Opera**: Has its own [Opera addons](https://addons.opera.com/developer/)
  store and accepts Chromium extension zips, but market share is small enough
  that it is probably not worth the overhead for a niche extension
