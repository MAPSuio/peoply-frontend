/**
 * The shape shared by the "pick exactly one of these" controls: the tab strip
 * and the scrollable tag row. Both took the same three props spelled out twice,
 * which is the sort of thing that drifts.
 */
export interface SelectionOption<T extends string> {
  label: string;
  value: T;
}

export interface SelectionProps<T extends string, Option = SelectionOption<T>> {
  options: Option[];
  selected: T;
  setSelected: (value: T) => void;
}
