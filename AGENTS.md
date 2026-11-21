# AGENTS.md — Instructions for AI Coding Agents

## Mission

When modifying this repository, implement the requested feature in the existing React/TypeScript architecture and preserve its established naming, file organization, API integration, UI behavior, and localization conventions. Do not replace the project architecture or introduce a new state-management, routing, styling, or UI framework unless the user explicitly requests it.

## Read before coding

1. Read `README.md` for the project purpose, commands, and active feature list.
2. Read the relevant references in `docs/`:
   - Architecture and routing: `ARCHITECTURE.md`, `ROUTES-AND-FEATURES.md`
   - API work: `API-AND-SERVICES.md`, `DATA-MODELS.md`
   - Forms and UI: `UI-AND-CODING-CONVENTIONS.md`
   - Authentication/authorization: `AUTHENTICATION-AND-PERMISSIONS.md`
   - Text and visual styling: `I18N-AND-STYLING.md`
   - Known inconsistencies: `CODEBASE-OBSERVATIONS.md`
3. Inspect the closest existing feature before creating files. Prefer `currency` or `country` for straightforward CRUD, `user` for more complex data entry, `role` for permission/relationship behavior, and `audit-log` for read-only search.
4. Verify current source and backend endpoint contracts. Documentation is a guide, not a substitute for inspecting nearby implementations.

## Architecture rules

- Keep global startup and top-level routes in `src/App.tsx`; keep the React root in `src/main.tsx`.
- Place feature code in a singular, kebab-case domain directory under `src/`.
- A routed feature normally has an `index.tsx` that composes nested routes, list/detail form files, a domain model under a nested domain folder, and a `service.ts` factory.
- Keep shared reusable UI in `src/components/` only when it is used across feature boundaries.
- Use React Router APIs from the existing `react-router` dependency. Do not add `react-router-dom` or another router.
- Reuse the existing global UI/runtime services configured in `App.tsx` (`uione` storage, loading, alerts, toast, currency/locale, resources, CSV service).

## Naming and TypeScript conventions

- Use TypeScript (`.ts` for models/services, `.tsx` for React components).
- Use kebab-case filenames and directories (`user-form.tsx`, `audit-log/`).
- Use PascalCase for React components and exported classes/types (`UserForm`, `UserService`, `UserClient`).
- Use camelCase for variables, functions, object properties, and API model fields (`userId`, `displayName`).
- Use type-only imports where appropriate: `import type { User } from "./service"`.
- Match `.prettierrc.json`: double quotes, no semicolons, 2-space indentation, trailing commas, print width 160.
- Keep imports grouped by external package then local module, as in neighboring files. Preserve the CSS import ordering in `App.tsx` when adding global styles.
- Do not loosen TypeScript types with `any` just to silence errors. Existing legacy `any` is not a pattern to expand.

## Domain model and API rules

- Define the entity, filter, service contract, and `Attributes` metadata together in the domain model file (for example `src/currency/currency/currency.ts`).
- Use camelCase in frontend interfaces. Map snake_case database columns explicitly with `column` in the `Attributes` object (for example `countryCode` → `country_code`).
- Mark primary-key attributes with `key: true`; specify `type`, `length`, `required`, `operator`, `q`, or `ignored` only when supported by the neighboring model and actual API contract.
- Use existing `onecore` contracts (`Filter`, `Service`, `SearchResult`, `Result`, `Tracking`, `Attributes`) rather than inventing parallel abstractions.
- Implement CRUD clients by extending the same `web-clients` base class used by the closest domain (`Client`, `SearchClient`, or `ViewSearchClient`). Do not guess inherited HTTP behavior; inspect the imported package's usage and the neighboring client.
- Create a lazy service getter that reads its base URL from `storage.config()`; follow the exact factory style of the closest feature. Some existing factories use a bound `ApplicationContext`; others use a module-level singleton.
- Add new API URLs to `src/config.ts` and document any required gateway path. Do not hardcode a service URL inside a component.
- Reuse the shared `HttpRequest` and `uione` `options` pattern where the neighboring service uses it.
- For custom operations, define them in a typed service interface and client class, not inline in the component.

## List/search page rules

- Follow a neighboring list form (`users-form.tsx`, `roles-form.tsx`, `countries-form.tsx`, `currencies-form.tsx`, or `locales-form.tsx`).
- Reuse `react-hook-core` helpers for URL filter parsing, filter merging, sorting, paging, field selection, and URL updates (`buildFromUrl`, `mergeFilter`, `setSortFilter`, `onPageChanged`, `onPageSizeChanged`, `onSearch`, `onSort`, `getFields`, `updateUrl`, `getOffset`, `buildMessage`).
- Use `PageSizeSelect` and `Pagination` from the existing dependencies.
- Keep search state (`filter`, result list, total/view/fields) consistent with the selected example. Existing list pages serialize search criteria into the URL; preserve that behavior.
- Show/hide loading around asynchronous work with `showLoading` / `hideLoading`; handle errors with `handleError`; use the established toast/message behavior.
- Preserve sort buttons' `data-field` and `id` conventions when using `onSort`.

## Detail/edit form rules

- Follow the closest `*-form.tsx` component. Use the same page/form structure and CSS classes (`form`, `row`, `section`, `main-body`, `header`, `footer`) instead of introducing a new component library.
- Initialize DOM form behavior with `initForm(ref.current, registerEvents)` where the neighboring form does so.
- Validate with `validateForm(ref.current, getLocale())` and the appropriate `ui-plus` blur handlers (`requiredOnBlur`, `emailOnBlur`, `phoneOnBlur`, `patternOnBlur`, etc.).
- Use `Status.Active` / `Status.Inactive` for the standard `A` / `I` status values.
- New entity: call `service.create(entity)` after validation and the standard confirmation flow.
- Existing entity: retain a cloned original record, calculate the delta with `makeDiff(entity, original, [primaryKeyField])`, warn when there are no changes, and call `service.patch(diff)` when the corresponding backend supports PATCH.
- Use `showFormError` for field validation results, `isSuccessful` for success detection where the neighboring feature does, and existing alert helpers for success/warning/error states.
- Use `onBack` or the same dirty-form confirmation pattern where the page has editable state.
- Keep read-only states aligned with `hasPermission` and the existing `setReadOnly` helper. A hidden or disabled UI control is not a backend authorization mechanism; backend permission checks remain authoritative.

## Localization and styling

- Never hardcode user-visible strings in feature JSX when an equivalent resource key should exist.
- Add each new key to both `src/core/resources/en.ts` and `src/core/resources/vi.ts`, or the relevant domain-specific `en.ts` / `vi.ts` pair.
- Register any new resource pair in `src/core/resources/index.ts` so it is merged into both languages.
- Follow the existing snake_case resource-key naming convention.
- Use the global CSS under `src/assets/css/` for shared patterns. Add feature CSS beside the feature only when necessary, following `src/core/layout.css`, `src/role/style.css`, or `src/audit-log/style.css`.
- Reuse the existing Material Icons font classes and supplied assets where appropriate.

## Authentication and permissions

- Do not implement a second token/user store. Use the existing `uione` storage and hooks (`storage`, `useUser`, `getUser`, `getPrivileges`, `hasPermission`, `useResource`).
- Authentication/password/signup/OAuth requests belong behind the clients in `src/authentication/service.ts`.
- Use `hasPermission` in the same form as the neighboring feature. Existing code checks read/write/delete capabilities at list, detail, and assignment levels; verify the resource/action level before adding controls.
- Role permissions use the nested privilege tree and integer action bitmasks. Do not convert them to booleans or replace the bitwise representation without changing and verifying the backend contract.
- Do not log credentials, tokens, passcodes, or other secrets.

## Before finishing

- Run `npm run build` and `npm run lint` when dependencies are installed.
- Review changed imports and ensure no unused variables/imports remain; the TypeScript config enables `noUnusedLocals` and `noUnusedParameters`.
- Verify both English and Vietnamese resources.
- Verify route reachability, permission/read-only behavior, loading/error handling, URL-backed search behavior, and API field mapping.
- Do not claim tests passed unless they were actually run. The supplied archive currently has no test script or test/spec files.
- Avoid unrelated refactors. The repository contains duplicated service implementations and legacy conventions documented in `docs/CODEBASE-OBSERVATIONS.md`; do not consolidate them as part of an ordinary feature request.
