# Location Search

This frontend no longer depends on provider-specific geocoder payloads.

## Current flow

Shared location inputs now use a normalized backend contract:

- `services/locationSearch.ts`
  - Calls `GET /locations/search`
- `types/locationSearch.ts`
  - Defines the provider-neutral result shape used in the UI
- `components/inputs/TextInputLocationSelect.tsx`
  - Debounced search input shared by create-event and edit-event flows

Both event flows use the same state shape:

- `hooks/useCreateEventForm.ts`
- `components/EditSummaryPage.tsx`

## Why this changed

The old flow stored Azure Maps response objects directly in React state. That
made the form code depend on Azure-specific fields and made provider changes far
more invasive than they should have been.

The new contract keeps the UI stable even if the backend provider changes.

## Normalized result shape

The UI expects these fields:

- `poi.name`
  - Optional venue or place name
- `address.freeformAddress`
  - Display string shown in the input and summary views
- `address.*`
  - Structured fields persisted with the event
- `position.lat` / `position.lon`
  - Coordinates used for event storage and map links

Do not import provider-specific geocoder types into components. If a new field
is needed from a provider, add it to the normalized contract first.

## Search options

`TextInputLocationSelect` accepts provider-neutral options:

- `countryCode`
- `lat`
- `lon`
- `limit`
- `includePoi`

The create/edit flows currently bias results using `ipInfo` from `useUser()`.

## Behavioural notes

- Search is still debounced in the client before each request.
- Errors now clear the suggestion list instead of leaving the component in a
  perpetual loading state.
- Coordinates are appended to event form data when defined, not just when
  truthy, which avoids silently dropping `0` values.

## Extending the UI

If a future screen needs strict address-only lookup:

1. Reuse `TextInputLocationSelect`.
2. Pass `includePoi: false` in the search options.
3. Keep consuming `LocationSearchResult`, not provider-specific data.
