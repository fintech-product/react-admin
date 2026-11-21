# UI and Coding Conventions

## TypeScript and formatting

The repository's `.prettierrc.json` sets:

- `printWidth: 160`
- `tabWidth: 2`
- `trailingComma: "all"`
- `semi: false`
- `singleQuote: false`

The source uses double-quoted imports/strings, no semicolons, 2-space indentation, camelCase values, PascalCase components/types/classes, and kebab-case file names. The app compiler enables `strict`-adjacent checks through the Vite TypeScript template settings, notably `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, and `noEmit`.

Use `import type` for type-only imports. Keep JSX in `.tsx` and models/services in `.ts`.

## Component structure

Most page components are exported as named arrow functions:

```tsx
export const ExampleForm = () => {
  const resource = useResource()
  const [state, setState] = useState(initialState)
  // handlers and effects
  return (
    <div>
      <header>
        <h2>{resource.example}</h2>
      </header>
      <div className="main-body">...</div>
    </div>
  )
}
```

A few page/shell components use default function exports. Match the existing module export style in the feature being extended.

## List and search pages

Use the list component in the same feature as the template. A typical list page:

1. Defines a typed search-state interface extending `Sortable`.
2. Creates the domain filter with `resources.defaultLimit`.
3. Uses `useResource`, `useRef<HTMLFormElement>`, and React state for filter/list/presentation state.
4. On initial mount, parses URL search values with `buildFromUrl`, merges defaults with `mergeFilter`, initializes sorting, and performs the first search.
5. Uses `getFields(refForm.current, state.fields)` to collect selected return fields.
6. Calls `updateUrl` so search, paging, and sorting remain reflected in the query string.
7. Calls the domain service's `search` and consumes `{ list, total }`.
8. Displays `PageSizeSelect`, `Pagination`, sorting headers, a table/list toggle, and optional create links.

Common helpers imported from `react-hook-core` include `buildFromUrl`, `mergeFilter`, `setSortFilter`, `onSearch`, `onSort`, `onPageChanged`, `onPageSizeChanged`, `onToggleSearch`, `onClearQ`, `getOffset`, `getFields`, `buildMessage`, and `updateUrl`. Only import helpers actually needed by the page.

Search methods normally wrap asynchronous work with `showLoading()` / `hideLoading()`, send errors to `handleError`, and display result feedback with `toast(buildMessage(...))`.

## Detail forms

Typical create/edit page flow:

1. Define a `createX()` initializer and set standard defaults such as `Status.Active`.
2. Read `id` using `useParams()`; `!id` means create mode.
3. Load existing entity in `useEffect`, clone it as the original snapshot, and initialize DOM validation with `initForm(refForm.current, registerEvents)`.
4. Bind fields to the entity and update state through `setX`.
5. Call `validateForm(refForm.current, getLocale())` on save.
6. Confirm the operation with `confirm(resource.msg_confirm_save, callback)`.
7. Create a new entity with `service.create(entity)`, or calculate `makeDiff(entity, initialEntity, [primaryKey])` and call `service.patch(diff)` for changed existing data.
8. Route back after success with `navigate(-1)` or the established success callback.

Existing pages use `clone`, `isEmpty`, `isSuccessful`, `makeDiff`, and `onBack` from `react-hook-core`; validation and field errors come from `ui-plus`; alerts and confirmation come from `ui-alert`.

Validation helpers seen in use include `requiredOnBlur`, `emailOnBlur`, `phoneOnBlur`, `patternOnBlur`, `digitOnKeyDown`, `validateForm`, `showFormError`, and `addError`.

## React state details

The code often mutates a local entity or filter object and then invokes its setter (`entity.field = value; setEntity(entity)`). Some older components also mutate arrays in place. This is an established legacy pattern, but it can prevent reliable rendering when React sees the same object identity. For new or significantly changed state logic, prefer immutable updates (`setEntity({ ...entity, field: value })` and array `filter`/spread operations) while preserving the surrounding component's expected data flow.

Do not create state at module scope for mutable per-user/per-page data. Module-scope state in service files is used for cached service instances only.

## Permission-aware UI

Use `hasPermission` from `uione` to control create/edit/delete/assignment actions. Existing code sometimes imports `Permission` and sometimes imports named permission values such as `write`; copy the exact convention used by the closest screen and verify the numeric scope/argument. Avoid reinterpreting the parameters without checking the shared package behavior and backend privileges.

## Markup and CSS

The app uses native HTML form elements and CSS classes rather than a component-library design system. Common classes include:

- layout: `view-container`, `main-body`, `form-body`, `view-header`, `view-footer`;
- form: `form`, `row`, `section`, `col s12 m6`, `radio-group`, `checkbox-container`;
- list/search: `search-group`, `search-input`, `list-result`, `table-responsive`, `table`, `list`;
- actions: `btn-group`, `btn-new`, `btn-back`, `btn-search`, `btn-table`, `btn-list`, `btn-close`.

Use the grid classes and field wrappers from neighboring pages. Avoid adding inline styling unless the nearby component does so for a specific layout detail.

## Async UI feedback

- Global loading: `showLoading()` and `hideLoading()` from `ui-loading` or configured `loading` from `uione`.
- Errors: `handleError` from `uione`.
- Confirmation: `confirm` from `ui-alert`.
- Success/warning/error dialogs: `alertSuccess`, `alertWarning`, `alertError` where the feature uses them.
- Toast/message: `toast` from `ui-toast`, or `showMessage` from `uione`.

Keep paired show/hide calls in `finally()` when using promise chains.
