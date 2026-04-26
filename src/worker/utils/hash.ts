// Password hashing using PBKDF2 (Web Crypto API) for Cloudflare Workers

const encoder = new TextEncoder();

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt(length = 16): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return arrayBufferToHex(bytes.buffer);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const hash = arrayBufferToHex(derived);
  return `${salt}$${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split('$');
  if (!salt || !hash) return false;

  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  const computed = arrayBufferToHex(derived);
  return computed === hash;
}
