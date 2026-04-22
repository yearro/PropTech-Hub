/**
 * Default fallback avatar URL used when a user's avatar image is missing or broken.
 * Uses the ui-avatars.com service to generate a simple icon with the app's brand color.
 */
export const DEFAULT_AVATAR_URL =
  "https://ui-avatars.com/api/?background=0d6e6e&color=fff&bold=true&name=U";

/**
 * Returns a fallback avatar URL with the user's initials.
 * @param name - The user's name to generate initials from.
 */
export function getAvatarFallback(name?: string | null): string {
  const initials = name
    ? encodeURIComponent(name.trim())
    : "U";
  return `https://ui-avatars.com/api/?background=0d6e6e&color=fff&bold=true&size=128&name=${initials}`;
}
