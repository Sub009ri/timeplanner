/** Tiny unique-id helper — no native crypto needed in Expo Go. */
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
