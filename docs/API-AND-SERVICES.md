# API and Service Layer

## URL configuration

`src/config.ts` is the single central URL object passed to `storage.setConfig(config)` by `src/App.tsx`.

| Config key | Current default | Used by |
| --- | --- | --- |
| `authentication_url` | `http://localhost:8083` | `AuthenClient` base + sign-out request in layout |
| `signup_url` | `http://localhost:8082/signup` | `SignupClient` |
| `password_url` | `http://localhost:8082/password` | `PasswordClient` |
| `oauth2_url` | `http://localhost:8082/oauth2` | `OAuth2Client` |
| `master_data_url` | `http://localhost:8083/code` | language/date-format master data |
| `user_url` | `http://localhost:8083/users` | user search/CRUD and role-based user lookup |
| `role_url` | `http://localhost:8083/roles` | role search/CRUD and assignment |
| `privilege_url` | `http://localhost:8083/privileges` | privilege tree for role permission editor |
| `audit_log_url` | `http://localhost:8083/audit-logs` | audit-log search |
| `settings_url` | `http://localhost:8083/settings` | user preference update |
| `currency_url` | `http://localhost:8083/currencies` | currency CRUD/search |
| `country_url` | `http://localhost:8083/countries` | country CRUD/search |
| `locale_url` | `http://localhost:8083/locales` | locale CRUD/search |

`env.sit.authentication_url` and `env.deploy.authentication_url` are exported in the same file, but the current application code does not select either one. Verify deployment wiring rather than assuming these are active.

## Service-layer pattern

Typical service files:

1. Import Axios, `HttpRequest`, and (where used) `options` and `storage` from `uione`.
2. Create a reusable module-scope `HttpRequest`.
3. Define a small `Config` interface for required URL properties.
4. Export a typed `getXService()` factory.
5. Lazily instantiate and cache the client using `storage.config()`.

There are two factory styles in the current code:

- Module-level singleton variable (`let userService`, `getUserService()`), used by user/role/settings/audit services.
- `ApplicationContext` with bound methods and a `context` instance, used by country/currency/locale services.

Follow the style of the nearest feature. A new feature should not introduce a third pattern without a reason.

## Domain client inheritance

| Domain | Client base | Model metadata | Notes |
| --- | --- | --- | --- |
| User CRUD | `Client<User, string, UserFilter>` | `userModel` | `searchGet = true`; custom `getUsersByRole(roleId)` |
| Role | `Client<Role, string, RoleFilter>` | `roleModel` | `searchGet = true`; custom `getPrivileges()` and `assign()` |
| Country | `Client<Country, string, CountryFilter>` | `countryModel` | `searchGet = true` |
| Currency | `Client<Currency, string, CurrencyFilter>` | `currencyModel` | `searchGet = true` |
| Locale | `Client<Locale, string, LocaleFilter>` | `localeModel` | `searchGet = true` |
| Audit log | `ViewSearchClient<AuditLog, string, AuditLogFilter>` | `auditLogModel` | Search/view only |
| Shared user lookup | `SearchClient<User, string, UserFilter>` | Separate `userModel` | Search-only user client, supports excluding IDs |

The base classes come from `web-clients`. Their exact HTTP behavior is not reimplemented in this repository; inspect existing usages before overriding or relying on a method.

## Explicit custom requests

| Operation | Code | Request |
| --- | --- | --- |
| Load available privilege tree | `src/role/role/index.ts` | `GET` to configured `privilege_url` |
| Assign users to a role | `RoleClient.assign()` | `PUT ${role_url}/${roleId}/assign` with `string[]` user IDs |
| Load users assigned to role | `UserClient.getUsersByRole()` | `GET ${user_url}?roleId=${roleId}` |
| Load master data | `MasterDataClient.getMasterData(code)` | `GET ${master_data_url}/${code}`; current codes are `language` and `date_format` |
| Save language/date settings | `SettingsClient.save()` | `PATCH ${settings_url}` with `{ language, dateFormat }` |

Authentication service clients are supplied by external packages:

- `AuthenClient<User>` at `authentication_url + "/authenticate"`.
- `PasswordClient` at `password_url`.
- `OAuth2Client` at `oauth2_url + "/authenticate"` and `oauth2_url + "/configurations"`.
- `SignupClient<Signup>` using `signup_url + "/signup"` and the configured signup URL.

The layout sign-out handler directly calls `authentication_url + "/authentication/signout/"`.

## Request options and cookies

`App.tsx` sets `axios.defaults.withCredentials = true`. Most admin feature services create `new HttpRequest(axios, options)` using the `uione` request options. `src/authentication/service.ts` creates `new HttpRequest(axios)` without passing `options`. Preserve the neighboring implementation and verify behavior when changing request handling.

## Error and result conventions

- Components generally call `handleError` in promise catch handlers.
- Long requests use `showLoading()` and `hideLoading()` (or the globally configured loading service).
- Search results have `{ list, total }` shape via `SearchResult<T>`.
- Create/update/patch methods use `Result<T>` in the domain contracts. Components check for an array of validation errors and pass it to `showFormError`; successful results are checked with `isSuccessful` in several forms.
- Delete methods may return a numeric count in a `Service` contract; inspect the particular domain before handling.

Do not invent a response shape. Inspect both the service interface and backend endpoint when changing or adding behavior.
