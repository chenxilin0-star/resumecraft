// Lightweight JWT implementation for Cloudflare Workers using Web Crypto API

const encoder = new TextEncoder();

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return atob(base64);
}

async function signHmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

export interface JwtPayload {
  sub: string | number;
  email: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}

export async function jwtSign(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, expiresInSeconds = 7 * 24 * 60 * 60): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  } as JwtPayload;

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = await signHmac(signingInput, secret);

  return `${signingInput}.${signature}`;
}

export async function jwtVerify(token: string, secret: string): Promise<JwtPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const [headerB64, payloadB64, signature] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = await signHmac(signingInput, secret);

  if (signature !== expectedSig) throw new Error('Invalid signature');

  const payload = JSON.parse(base64UrlDecode(payloadB64)) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error('Token expired');

  return payload;
}
