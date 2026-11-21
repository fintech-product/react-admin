# Authentication and Permissions

## Authentication-related pages

`src/App.tsx` registers these routes outside the authenticated admin shell:

- `/` and `/signin` → `SigninForm`
- `/signup` → `SignupForm`
- `/forgot-password` → `ForgotPasswordForm`
- `/reset-password` → `ResetPasswordForm`
- `/change-password` → `ChangePasswordForm`

The form components delegate network operations to typed clients in `src/authentication/service.ts`:

- `getAuthenticator()` returns an `AuthenClient<User>`.
- `getSignupService()` returns `SignupClient<Signup>`.
- `getPasswordService()` returns `PasswordClient`.
- `getOAuth2Service()` returns `OAuth2Client`.

These classes come from external packages. The local repository shows how their URLs are assembled and invoked, but not their internal protocol implementations.

## Sign-in state

On successful authentication, `SigninForm` stores:

- authentication token using `storage.setToken(result.token)`;
- user object using `storage.setUser(result.user)`;
- privileges using `storage.setPrivileges(result.user?.privileges)`;
- then navigates to `storage.home` (configured as `/home`).

If a two-factor step is required, the form switches from username/password inputs to a passcode input. Sign-in also supports a remembered-account cookie flow. Error statuses are translated through the authentication resource map.

On sign-out, `core/layout.tsx` sends the sign-out request, clears session storage, clears the user in `uione` storage, and navigates to `/signin`.

## Shared identity and resource state

Use `uione` as the integration boundary for authentication state and shared application data:

- `storage` for configuration, token, user, privileges, locale/resource setup;
- `useUser()` for the current user;
- `getUsername()` for displayed username;
- `getPrivileges()` for the current privilege/module tree;
- `useResource()` for localized text;
- `getLocale()` / `useLocale()` and `getDateFormat()` / `getLanguage()` for locale preferences.

Do not introduce a second token store or duplicate authentication state in a new feature.

## Navigation privileges and modules

The backend schema uses `modules` as a hierarchy (through `parent`) and stores role-to-module access in `role_modules(role_id, module_id, permissions)`. `user_roles` associates users with roles.

The layout reads privileges through `getPrivileges()` and passes them to the `Nav` component from `reactx-nav`. The navigation tree therefore depends on the signed-in user's effective privilege data.

`src/role/role-form.tsx` separately fetches the privilege tree from `privilege_url`. The expected shape is:

```ts
interface Privilege {
  id: string
  name: string
  actions: number
  children?: Privilege[]
}
```

Role configuration combines each module's supported `actions` bitmask with a `permissions` bitmask. The form derives individual checkbox action values as powers of two, uses bitwise operations to set/clear actions, and stores role privilege entries as strings in the form `"<module-id> <permission-mask>"`. It also derives parent-module display/permission values from child modules.

Do not replace this representation with a simple boolean map. The backend permission contract depends on integer masks.

## UI permission checks

Examples in current feature components:

- List pages use `hasPermission(Permission.write)` to decide whether to show a create button.
- User and role detail pages use `hasPermission(Permission.write, 1)` or `hasPermission(write, 1)` to choose editable/read-only presentation.
- Assignment pages use a separate scope argument (for example `hasPermission(Permission.write, 2)` / `hasPermission(write, 2)`).

The exact meaning of the second argument is defined by the external `uione` package and backend permission contract; verify before copying it into a new resource. Backend APIs must still enforce authorization—the frontend check is only UI behavior.

## Security considerations

- Never write passwords, passcodes, access tokens, or session cookies to logs or resource strings.
- Avoid changing cookie credentials, origin behavior, or sign-out behavior without checking the gateway's CORS and authentication configuration.
- The sign-in flow stores server-returned identity/privilege information. Do not treat client-provided role IDs or hidden controls as authorization proof.
- For a new feature, use the backend module/permission configuration and the existing `hasPermission` behavior rather than creating unrelated client-only permissions.
