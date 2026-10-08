// no look-alike characters (0/O, 1/l/I) — the password is read out or typed from a screen
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";

const pick = (alphabet: string) =>
  alphabet[crypto.getRandomValues(new Uint32Array(1))[0] % alphabet.length];

/** A random password with letters and digits (never digits only), e.g. "Kp7mWx3Rt9Zq". */
export function generatePassword(length = 12): string {
  const chars = [pick(LETTERS.toUpperCase()), pick(LETTERS.toLowerCase()), pick(DIGITS)];
  while (chars.length < length) chars.push(pick(LETTERS + DIGITS));
  // shuffle so the required characters aren't always first
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
