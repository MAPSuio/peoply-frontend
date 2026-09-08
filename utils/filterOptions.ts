export interface FilterOption<T> {
  value: T;
  label: string;
}

export function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function sortedUniqueOptions<T>(
  options: FilterOption<T>[],
): FilterOption<T>[] {
  const firstOfEachValue = new Map<T, FilterOption<T>>();

  for (const option of options) {
    if (!firstOfEachValue.has(option.value)) {
      firstOfEachValue.set(option.value, option);
    }
  }

  return [...firstOfEachValue.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "nb-NO"),
  );
}

export function matchingOptions<T>(
  options: FilterOption<T>[],
  search: string,
): FilterOption<T>[] {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return options;
  }

  return options.filter((option) =>
    normalizeSearchValue(option.label).includes(normalizedSearch),
  );
}
