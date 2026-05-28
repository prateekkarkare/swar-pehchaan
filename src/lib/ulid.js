/**
 * Tiny ULID-like ID generator.
 * Lexicographically sortable by time. Collision-safe for our scale.
 */
export function ulid() {
  const ts = Date.now().toString(36).padStart(9, '0');
  const rand = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('');
  return `${ts}${rand}`;
}
