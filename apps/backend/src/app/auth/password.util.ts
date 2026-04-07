import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const HASH_PREFIX = 'scrypt';

export function hashSecret(value: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(value, salt, KEY_LENGTH).toString('hex');
  return `${HASH_PREFIX}:${salt}:${derivedKey}`;
}

export function verifySecret(value: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) {
    return false;
  }

  const [prefix, salt, hash] = storedHash.split(':');
  if (prefix !== HASH_PREFIX || !salt || !hash) {
    return false;
  }

  const derivedKey = scryptSync(value, salt, KEY_LENGTH);
  const storedKey = Buffer.from(hash, 'hex');

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}
