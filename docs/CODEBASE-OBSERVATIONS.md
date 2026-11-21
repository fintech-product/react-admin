# Codebase Observations and Cautions

This file records concrete observations from the supplied source archive. It is intended to prevent an AI agent from treating repeated or inconsistent code as a single, uniform abstraction. These are investigation notes, not automatic change requests.

## Duplicate user client implementations

There are two different `UserClient` classes for the same configured `/users` endpoint:

1. `src/user/user/index.ts` extends `web-clients` `Client<User, string, UserFilter>` and provides the CRUD-oriented `UserService` used by user maintenance.
2. `src/service/user/index.ts` extends `SearchClient<User, string, UserFilter>` and is used by the shared `UsersLookup` modal. It additionally overrides `postOnly()` when `filter.excluding` is populated.

Their model metadata is not identical. The CRUD model maps `imageURL` to `image_url` and includes tracking fields; the shared search model has a different attribute map and a filter field named `excluding`. The role service imports the shared `src/service/user` client, while the user feature creates its own client through `src/user/service.ts`.

Do not consolidate these clients or change their filters as part of an unrelated feature. If they are unified intentionally, verify that user CRUD, user lookup, role assignment, field projection, and the backend query contract all continue to work.

## Audit-log factory appears twice

Both `src/audit-log/service.ts` and `src/audit-log/audit-log/index.ts` define a module-scoped `HttpRequest`, `Config`, lazy audit service cache, and `getAuditLogService()`. The page in `src/audit-log/index.tsx` imports from `./audit-log`, which resolves to the nested directory implementation. Confirm usage before deleting or changing either file.

## Environment config variants are not selected

`src/config.ts` exports `config` plus `env.sit` and `env.deploy`. `src/App.tsx` calls `storage.setConfig(config)`, and no `env.*` usage or `import.meta.env` selection was found in the application source. Therefore, the SIT/deploy authentication URL overrides should not be assumed active. Resolve environment injection explicitly before deployment changes.

## Model/interface metadata differences

The following differences are visible in source and should be verified against backend behavior before modification:

- `User` has optional `roles`, but the CRUD `userModel` does not declare a `roles` metadata attribute.
- `Country` interface has `status`, but `countryModel` does not declare a `status` attribute.
- `AuditLog` interface has `email`, but `auditLogModel` does not declare an `email` attribute.
- `Role.privileges` is marked `ignored: true` in `roleModel`; `role-form.tsx` constructs the string-based permission data itself.

These may be intentional because some properties are computed, relationship-driven, or handled outside the generic model mapper. Do not add/remove metadata without understanding the API and base-client behavior.

## State mutation patterns

Multiple components update objects/arrays in place and then pass the same object reference to a React setter. Examples include user/country form field handlers, role/user assignment arrays, and filter updates. This is an established legacy pattern, but React rendering can be sensitive to referential equality. For new state logic, use immutable updates where practical. Avoid a broad state-management rewrite during feature work.

## Legacy/bootstrap artifacts

- `index.html` includes inline functions `yesOnClick` / `noOnClick` and DOM hosts for loading, toast, and alert UI. These are part of the existing alert integration; do not remove them without tracing `ui-alert` behavior.
- `src/App.css` and `src/index.css` exist but are not imported by the current entry chain. Global admin styles are imported directly from `src/App.tsx`.
- `index.html` still has the title `my-app` and `package.json` uses the name `my-app`.
- Empty directories such as `article`, `company`, `job`, `my-articles`, and `my-profile` exist in the archive but are not implemented or routed.

## Test/build coverage

No test or spec files and no test script were found in the supplied archive. `package.json` defines `dev`, `build`, `lint`, and `preview`. The build script runs `tsc -b && vite build`; lint uses ESLint. The archive does not contain `node_modules`, so dependency installation is required before running those commands.

## Suggested safe workflow

- Before modifying an endpoint, trace component → service getter → client class → model metadata → backend route.
- Before changing permissions, inspect the nested privilege tree and integer action masks in `role-form.tsx` plus the backend `modules` / `role_modules` semantics.
- Before changing a form, inspect its original snapshot/diff handling and its form validation helpers.
- Before changing translations/styles, inspect the resource registry and global CSS import sequence.
- Prefer the smallest domain-local change and preserve current behavior in neighboring features.

## Additional small inconsistencies to verify

- `src/core/about.tsx` reads `useParams().param`, while the route parameters declared in `src/App.tsx` are named `:number`. The displayed parameter therefore appears mismatched.
- The email field in `src/user/user-form.tsx` calls `normalizePhone()` in its `onChange` handler, just like the phone field. This may be unintended; confirm the behavior of `normalizePhone` and the expected email value before touching this code.
- The role assignment screen under `/users/:id/assign` PATCHes `{ userId, roles }` through the user service, while the `roles` property is optional on the TypeScript user interface and absent from the shown CRUD `userModel`. Treat this as a special backend relationship contract, not an ordinary mapped `users` column.
