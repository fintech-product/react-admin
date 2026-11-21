# Internationalization and Styling

## Resource maps

The application supports English (`en`) and Vietnamese (`vi`). Resource objects are assembled in `src/core/resources/index.ts`:

- common resources: `src/core/resources/en.ts` and `vi.ts`;
- admin-specific resources: `src/core/resources/admin/en.ts` and `vi.ts`;
- authentication resources: `src/core/resources/authentication/en.ts` and `vi.ts`;
- country/currency/locale resources: `src/core/resources/country/en.ts` and `vi.ts`.

The exported `resources` object is registered in `App.tsx` using `storage.setResources(locales)`. Components read current text via `useResource()` from `uione`.

## Adding translations

1. Use the appropriate resource group for the feature (create a matching domain folder under `src/core/resources/` when it is a new domain-specific group).
2. Add the same key to English and Vietnamese maps.
3. Register both imported maps in `src/core/resources/index.ts` and spread them into the `en` and `vi` resource objects.
4. Reference the key from JSX using `resource.key_name`.

Resource keys generally use snake_case (for example `currency_decimal_digits`, `msg_confirm_save`, `error_not_found`). Keep keys semantically consistent and avoid embedding English labels directly in feature markup.

## Global CSS loading

The global styles and fonts are imported in `src/App.tsx`. The current import sequence is intentional and should be preserved unless testing demonstrates a need to change the cascade:

1. reset and Material Icons / Roboto fonts;
2. checkbox, radio, grid, alert, loader, page, and main styles;
3. modal, multi-select, form, article, card, table, list/detail, data-list, and solid-container styles;
4. button, search, layout, theme, dark, grey, grey-dark, and badge styles.

The project includes stylesheet files under `src/assets/css/`. Feature-specific CSS is currently present in `src/core/layout.css`, `src/role/style.css`, and `src/audit-log/style.css`.

`src/App.css` and `src/index.css` exist in the supplied archive but are not imported by `src/main.tsx`, `src/App.tsx`, or `index.html` in the inspected source. They appear to be Vite-template remnants; do not rely on their rules being active without explicitly adding an import.

## Fonts and icons

- Roboto font files and CSS are under `src/assets/fonts/Roboto/`.
- Material Icons font CSS and font files are under `src/assets/fonts/material-icon/`.
- Existing UI markup uses `<i className="material-icons">icon_name</i>`.
- Image assets are under `src/assets/images/`; user avatar defaults include male/female images.

Reuse existing fonts/icons/assets where possible. Do not add a new icon/font package for a small visual requirement.

## Visual conventions

The UI is primarily hand-authored HTML and CSS. Follow neighboring pages for the grid, form, search, table, list, button, modal, badge, and alert conventions. Avoid introducing a new CSS framework or global reset.
