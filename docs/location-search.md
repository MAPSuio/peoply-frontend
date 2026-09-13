# Location Search

The UI never sees a provider-specific geocoder payload. It reads the normalized
contract the backend returns from `GET /locations/search`, which is documented
once, in [the backend's own `docs/location-search.md`](https://github.com/MAPSuio/peoply-backend/blob/master/docs/location-search.md).
Backend owns the shape, so that document is the one to change when a field is
added, and the one to read when you need to know what a result carries.

## Where it lives here

- `services/locationSearch.ts`
  - Calls `GET /locations/search`
- `types/locationSearch.ts`
  - Mirrors the backend contract for the UI
- `components/inputs/TextInputLocationSelect.tsx`
  - The search input shared by the create-event and edit-event flows

Both event flows keep the same state shape, in `hooks/useCreateEventForm.ts` and
`components/EditSummaryPage.tsx`.

## What the UI reads

`poi.name` for a venue name, `address.freeformAddress` for what the input and
the summary display, the rest of `address.*` for what is persisted with the
event, and `position.lat` / `position.lon` for storage and map links. The
backend contract carries more than this; a screen that needs one of the other
fields should read the backend document rather than guess.

Do not import provider-specific geocoder types into components. If a new field
is needed from a provider, add it to the normalized contract first.

## Search options

`TextInputLocationSelect` accepts provider-neutral options: `countryCode`,
`lat`, `lon`, `limit` and `includePoi`. The create and edit flows bias results
using `ipInfo` from `useUser()`.

Search is debounced in the client before each request, and a failed request
clears the suggestion list rather than leaving the input loading forever.
Coordinates are appended to the event form when defined rather than when truthy,
so a `0` is not silently dropped.

## Extending the UI

A screen that needs strict address-only lookup reuses
`TextInputLocationSelect`, passes `includePoi: false`, and keeps consuming
`LocationSearchResult` rather than provider-specific data.
