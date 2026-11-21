# React Admin

React Admin is a browser-based administration SPA for the `admin-service` backend. It provides account administration, role and privilege management, localization settings, country/currency/locale maintenance, and audit-log search. Authentication, signup, password operations, and OAuth2 are delegated to the configured authentication-related services.

The project is written in TypeScript with React and Vite. Its UI and service code use shared packages from the `onecore` / `reactx` / `ui-*` ecosystem rather than a large component framework.

## Main capabilities

| Area | Routes | Purpose |
| --- | --- | --- |
| Authentication | `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/change-password` | Sign in, registration, and password workflows |
| Home and shell | `/home`, `/about` | Authenticated application shell, module navigation, profile/menu controls |
| Users | `/users`, `/users/new`, `/users/:id`, `/users/:id/assign` | User search, maintenance, and role assignment |
| Roles | `/roles`, `/roles/new`, `/roles/:id`, `/roles/:id/assign` | Role maintenance, module/action permissions, and user assignment |
| Audit logs | `/audit-logs` | Search and display audit events |
| Settings | `/settings` | User language and date-format preferences |
| Currency | `/currencies` and detail routes | Currency maintenance |
| Country | `/countries` and detail routes | Country and regional-format maintenance |
| Locale | `/locales` and detail routes | Locale maintenance |

## Technology

- React 19 and TypeScript 6
- Vite 8
- React Router 8
- Axios and `axios-core`
- `web-clients`, `onecore`, `uione`, and `react-hook-core`
- `ui-plus`, `ui-alert`, `ui-loading`, and `ui-toast`
- `reactx-pagination`, `reactx-nav`, and `react-groups`

See `package.json` for the authoritative dependency versions.

## Run locally

```bash
npm install
npm run dev
```

Build and lint:

```bash
npm run build
npm run lint
```

Preview the production build:

```bash
npm run preview
```

There is currently no test script or test/spec file in the supplied source archive.

## Backend configuration

API base URLs are centralized in `src/config.ts`. The active configuration passed to the global `uione` storage is the exported `config` object (`storage.setConfig(config)` in `src/App.tsx`). The default values currently target local services on ports `8082` and `8083`.

The same file exports `env.sit` and `env.deploy`, but no environment-selection logic referencing `env` was found in the current application source. Do not assume these variants are automatically applied. For a new backend endpoint, add it to the active `config` object and consume it through `storage.config()` in the corresponding service factory.

The frontend uses cookie credentials (`axios.defaults.withCredentials = true`). Confirm the backend/gateway CORS and cookie settings when changing origins or deployment topology.

## Source layout

```text
src/
├── App.tsx                 # global initialization and route composition
├── main.tsx                # React root
├── config.ts               # backend service URLs
├── authentication/         # sign-in, signup, password, OAuth service clients
├── core/                   # authenticated shell, home/about, layout, resources
├── components/             # reusable cross-feature components
├── service/                # shared user-search service used by lookup UI
├── user/                   # user list/detail and role assignment
├── role/                   # role CRUD, permission editor, user assignment
├── audit-log/              # audit-log search
├── settings/               # user preferences and master-data clients
├── currency/               # currency maintenance
├── country/                # country maintenance
├── locale/                 # locale maintenance
└── assets/                 # global styles, fonts, and images
```

Several additional directories in the archive (`article`, `company`, `job`, `my-articles`, and `my-profile`) contain no implementation files. They are not active routes in the current `App.tsx` route tree.

## Architecture and conventions

- `App.tsx` initializes shared global services and declares routes.
- `core/layout.tsx` provides the authenticated shell and reads the signed-in user and privileges from `uione` storage.
- Feature folders own their route component, forms, model, and service wrapper.
- CRUD feature clients generally extend `web-clients` `Client`; list/search-only clients may extend `SearchClient` or `ViewSearchClient`.
- Domain model properties use camelCase. `Attributes` metadata maps properties to database snake_case columns where required.
- Forms use `react-hook-core` and `ui-plus` helpers for state updates, validation, and dirty-form handling.
- User-facing text belongs in the English and Vietnamese resource maps under `src/core/resources/`.

## Documentation for maintainers and AI agents

- [`AGENTS.md`](AGENTS.md) — instructions for AI coding agents working in this repository.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — application composition and feature structure.
- [`docs/ROUTES-AND-FEATURES.md`](docs/ROUTES-AND-FEATURES.md) — route map and feature responsibilities.
- [`docs/API-AND-SERVICES.md`](docs/API-AND-SERVICES.md) — backend URLs, service factories, clients, and custom requests.
- [`docs/DATA-MODELS.md`](docs/DATA-MODELS.md) — frontend model mapping to the admin database domains.
- [`docs/UI-AND-CODING-CONVENTIONS.md`](docs/UI-AND-CODING-CONVENTIONS.md) — TypeScript, React, forms, lists, and styling patterns.
- [`docs/AUTHENTICATION-AND-PERMISSIONS.md`](docs/AUTHENTICATION-AND-PERMISSIONS.md) — authentication state, navigation privileges, and role permission editing.
- [`docs/I18N-AND-STYLING.md`](docs/I18N-AND-STYLING.md) — translations, stylesheets, fonts, and UI assets.
- [`docs/CODEBASE-OBSERVATIONS.md`](docs/CODEBASE-OBSERVATIONS.md) — duplicated implementations, wiring caveats, and items to verify before refactoring.

## Important implementation note

This document describes the code as present in the supplied archive. Some patterns are duplicated or inconsistent; see `docs/CODEBASE-OBSERVATIONS.md` before consolidating services or changing existing API behavior. Prefer checking a neighboring working feature over assuming every domain follows an identical implementation.


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
