# Data Models and Backend Mapping

The frontend uses camelCase TypeScript properties and `onecore` `Attributes` metadata to describe database column names, key fields, types, constraints, query fields, and fields to ignore. The admin database schema supplied with the backend project uses PostgreSQL naming conventions, primarily snake_case columns.

## Main domain mapping

| Frontend domain | Backend table(s) | Relationship / API use |
| --- | --- | --- |
| User | `users` | User details; user-role relationship is managed separately |
| User roles | `user_roles` | User-to-role assignment screen |
| Role | `roles` | Role details and status |
| Role permissions | `role_modules`, `modules` | Role permission bitmasks against the module/privilege tree |
| Module tree | `modules` | Navigation and privilege structure returned through the privileges endpoint |
| Master data | `code_masters` | User language and date format options (`language`, `date_format`) |
| Audit log | `audit_logs` | Read-only audit search |
| Currency | `currency` | Currency code, symbol, and decimal-digit settings |
| Country | `country` | Country names, date/number formats, currency metadata |
| Locale | `locale` | Locale/country/date/number/currency metadata |
| Authentication | External auth service | Password/passcode records and authentication workflows are handled by the auth-related services, not direct frontend SQL access |

The browser never accesses PostgreSQL directly. It calls backend HTTP services.

## User

Defined in `src/user/user/user.ts`.

Important fields: `userId`, `username`, `email`, `displayName`, `imageURL`, `status`, `gender`, `phone`, `title`, `position`, optional `roles`, and `Tracking` fields.

Selected `userModel` mappings:

| TypeScript property | DB column / metadata |
| --- | --- |
| `userId` | `user_id`, required key, length 40 |
| `displayName` | `display_name`, required, searchable |
| `imageURL` | `image_url` |
| `createdBy`, `createdAt` | `created_by`, `created_at` |
| `updatedBy`, `updatedAt` | `updated_by`, `updated_at` |

`username`, `email`, and `displayName` are configured as query fields in the CRUD model. The interface includes optional `roles`, but the shown `userModel` does not define a `roles` attribute. Verify the API contract before adding serialization assumptions for this property.

## Role and privileges

Defined in `src/role/role/role.ts`.

`Role` contains `roleId`, `roleName`, `status`, `remark`, optional `privileges`, and `Tracking` fields. `roleModel` maps `roleName` to `role_name` and tracking values to their snake_case columns.

The permission editor fetches a nested privilege structure:

```ts
interface Privilege {
  id: string
  name: string
  actions: number
  children?: Privilege[]
}
```

The role's `privileges` field is a `string[]` marked as `ignored: true` in `roleModel`. The editor encodes values as strings such as `"module_id 7"`, where the number is a permission bitmask. Parent/child aggregation and action-checkbox behavior are implemented in `src/role/role-form.tsx`. Do not treat `privileges` as a simple array of booleans.

The backend schema associates users and roles through `user_roles(user_id, role_id)` and role access through `role_modules(role_id, module_id, permissions)`.

## Country

Defined in `src/country/country/country.ts`.

`Country` maps `countryCode` → `country_code` (key), `countryName` → `country_name`, `nativeCountryName` → `native_country_name`, `dateFormat` → `date_format`, `decimalSeparator` → `decimal_separator`, `groupSeparator` → `group_separator`, `currencyCode` → `currency_code`, `currencySymbol` → `currency_symbol`, `currencyDecimalDigits` → `currency_decimal_digits`, `currencyPattern` → `currency_pattern`, and `currencySample` → `currency_sample`.

The TypeScript interface includes optional `status`, but `countryModel` does not declare a `status` attribute in the supplied source. Verify before relying on model metadata for that field.

## Currency

Defined in `src/currency/currency/currency.ts`.

- `code`: key, length 3.
- `symbol`: length 4 and searchable.
- `decimalDigits`: maps to `decimal_digits`, integer, equality operator, 0–3 range.
- `status`: one-character equality filter.

This corresponds to backend `currency(code, symbol, decimal_digits, status)`.

## Locale

Defined in `src/locale/locale/locale.ts`.

The model maps `nativeName`, `countryCode`, `countryName`, `nativeCountryName`, `dateFormat`, `firstDayOfWeek`, decimal/group separators, and currency fields to the corresponding snake_case columns. `code` is the key. It corresponds to backend `locale`.

## Audit log

Defined in `src/audit-log/audit-log/audit-log.ts`.

The model includes `id`, `resource`, `userId`, `ip`, `action`, `time`, `status`, and `remark`. The filter includes a `TimeRange` for `time`. The interface also declares `email`, but the shown `auditLogModel` does not map it. Backend table is `audit_logs`.

## Code masters and settings

`SettingsForm` loads available languages and date formats from the `code_masters` service by requesting `language` and `date_format`. The selected settings payload is:

```ts
interface Settings {
  language: string
  dateFormat: string
}
```

It is PATCHed to `settings_url`. The supplied backend schema has the corresponding user preferences in `users.language` and `users.dateformat`; the API contract uses camelCase `dateFormat` at the frontend boundary.

The user form's title, position, gender, and status lists are currently hard-coded in `src/user/master-data.ts`; they are not loaded from `code_masters` in this frontend implementation.

## Tables without a visible feature in this archive

The supplied backend schema also includes `passwords`, `passcodes`, `histories`, and `notifications`. No direct frontend feature/model for these tables was found in this React archive. Password-related UI delegates to the authentication/password client packages. Do not add direct table-specific client assumptions without a backend API contract.
