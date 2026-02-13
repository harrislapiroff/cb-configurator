# Caller's Box Configurator

A browser extension (Manifest V3) that replaces gendered dance terminology on
the [Caller's Box](https://www.ibiblio.org/contradance/thecallersbox/) contra
dance choreography website with gender-neutral alternatives.

## Project Structure

```
extension/           # All extension source files (loaded directly, no build step)
  manifest.json      # MV3 manifest — defines content scripts, permissions, icons
  maps.js            # Term mapping constants (loaded first as a content script)
  main.js            # Core DOM manipulation logic (loaded second)
  options.html       # Settings popup / options page UI
  options.js         # Web Component for the settings form
  icons/             # Extension icons (48, 96, 128 px)
```

There is no build system or bundler. The extension source lives in `extension/`
and is loaded directly. `web-ext` is used for linting, running in Firefox, and
packaging for distribution.

## How It Works

1. `maps.js` defines `Map` constants for terminology substitutions (e.g.,
   `RSR_TERMS`, `ROLE_TERMS_BIRDS`, `ROLE_TERMS_LF`).
2. `main.js` runs as a content script on matching Caller's Box dance pages. It
   reads user preferences from `browser.storage.sync`, then performs DOM text
   replacements using the term maps.
3. `options.js` defines a `<cb-options-form>` custom element that persists
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
npm run lint
```

### Building for distribution

```sh
npm run build
```

This creates a `.zip` in `web-ext-artifacts/`.

### Code style

- Tab indentation (see `.editorconfig`)
- LF line endings
- Vanilla JS (ES6+), no frameworks or transpilation
- Cross-browser: uses `chrome`/`browser` API abstraction

### Testing

No automated tests. Test manually by loading the extension and visiting a
Caller's Box dance page such as:
https://www.ibiblio.org/contradance/thecallersbox/dance.php?id=7868
