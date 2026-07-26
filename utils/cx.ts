/**
 * Joins class names, dropping falsy entries.
 *
 * Exists because inline `${cond && styles.x}` template strings put the
 * literal strings "false" and "undefined" into the DOM class attribute.
 *
 *   cx(styles.card, compact && styles.compact, className)
 */
export default function cx(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}
