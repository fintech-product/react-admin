# Routes and Feature Responsibilities

## Top-level route tree

The routes below are registered in `src/App.tsx`.

| Route | Component | Notes |
| --- | --- | --- |
| `/` | `SigninForm` | Root route renders sign-in |
| `/signin` | `SigninForm` | Sign-in |
| `/signup` | `SignupForm` | Registration |
| `/change-password` | `ChangePasswordForm` | Change current password |
| `/reset-password` | `ResetPasswordForm` | Reset password using passcode/token flow |
| `/forgot-password` | `ForgotPasswordForm` | Request password reset |
| `/about` and `/about/:number` | `AboutPage` | Standalone About route |
| `/home` | `HomePage` | Inside `LayoutPage` |
| `/:number` | `AboutPage` | Nested catch-style numeric parameter route inside layout |
| `/settings` | `SettingsForm` | Inside layout |
| `/users/*` | `UsersRoute` | Inside layout |
| `/roles/*` | `RolesRoute` | Inside layout |
| `/currencies/*` | `CurrenciesRoute` | Inside layout |
| `/locales/*` | `LocalesRoute` | Inside layout |
| `/countries/*` | `CountriesRoute` | Inside layout |
| `/audit-logs` | `AuditLogsForm` | Inside layout |

`LayoutPage` is the parent element for the admin feature routes and renders nested content through `Outlet`.

## Feature-local routes

| Feature | Child route | Component |
| --- | --- | --- |
| Users | `/users` | `UsersForm` |
| Users | `/users/new` | `UserForm` |
| Users | `/users/:id` | `UserForm` |
| Users | `/users/:id/assign` | `RoleAssignmentForm` |
| Roles | `/roles` | `RolesForm` |
| Roles | `/roles/new` | `RoleForm` |
| Roles | `/roles/:id` | `RoleForm` |
| Roles | `/roles/:id/assign` | `RoleAssignmentForm` |
| Countries | `/countries` | `CountriesForm` |
| Countries | `/countries/new` | `CountryForm` |
| Countries | `/countries/:id` | `CountryForm` |
| Currencies | `/currencies` | `CurrenciesForm` |
| Currencies | `/currencies/new` | `CurrencyForm` |
| Currencies | `/currencies/:id` | `CurrencyForm` |
| Locales | `/locales` | `LocalesForm` |
| Locales | `/locales/new` | `LocaleForm` |
| Locales | `/locales/:id` | `LocaleForm` |

## Feature folder responsibilities

### `src/user/`

- `users-form.tsx`: paginated/searchable user list, list/table presentation, status filtering, and write-gated new-user navigation.
- `user-form.tsx`: create/load/update user details and local master lists (status, title, position, gender).
- `role-assignment-form.tsx`: show current user's roles, select/unselect roles, and save role IDs through the user service.
- `user/user/user.ts`: User/Filter/Service contracts and `userModel` metadata.
- `user/user/index.ts`: `UserClient` and role lookup client.
- `service.ts`: lazy factories for this feature's user, role, and static master-data services.

### `src/role/`

- `roles-form.tsx`: role search/list.
- `role-form.tsx`: create/load/patch role details and edit the module privilege bitmask matrix.
- `role-assignment-form.tsx`: manage users assigned to a role; includes the reusable `UsersLookup` modal.
- `role/role/role.ts`: Role, RoleFilter, Privilege, RoleService, and `roleModel`.
- `role/role/index.ts`: `RoleClient`, custom privilege GET, and assignment PUT.
- `service.ts`: lazy role and user service factories.

### Other domains

- `src/country/`: country list/detail and a `CountryClient`.
- `src/currency/`: currency list/detail and a `CurrencyClient`.
- `src/locale/`: locale list/detail and a `LocaleClient`.
- `src/audit-log/`: audit-log search using a view/search client; no create/edit route.
- `src/settings/`: language/date-format preferences and master-data/settings clients.
- `src/authentication/`: public authentication-related forms and wrappers for the authentication service clients.
- `src/components/users-lookup.tsx`: shared modal user search used by role assignment.
- `src/core/`: application shell, home/about content, layout CSS, and localized resource maps.

## Route additions

For a new routed CRUD feature, follow the route shape of `country`, `currency`, or `locale`:

1. Add a feature directory with list, detail, model/client, service factory, and route composition.
2. Add the route component in the feature's `index.tsx`.
3. Register it under `LayoutPage` in `src/App.tsx`.
4. Add a module/resource mapping consistent with the backend's module/privilege configuration.
5. Add the service URL in `src/config.ts` and translations in both languages.

Do not add a route solely because an empty directory exists. The `article`, `company`, `job`, `my-articles`, and `my-profile` directories are empty in the supplied archive and are not currently routed.
