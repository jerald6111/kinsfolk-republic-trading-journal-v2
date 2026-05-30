// Passcode-based encryption helpers (Web Crypto API).
// PBKDF2 (SHA-256) derives an AES-GCM key from the user's passcode; the
// journal data is encrypted at rest so it's unreadable without the passcode.

const enc = new TextEncoder()
const dec = new TextDecoder()

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export type SecurePayload = {
  v: 1
  salt: string // base64
  iv: string   // base64
  ct: string   // base64 ciphertext
}

async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Derive a key from a passcode + new random salt (used when creating a vault). */
export async function deriveNewKey(passcode: string): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(passcode, salt)
  return { key, salt }
}

/** Derive a key from a passcode + existing salt (used when unlocking). */
export async function deriveKeyFromSalt(passcode: string, saltB64: string): Promise<CryptoKey> {
  return deriveKey(passcode, b64ToBuf(saltB64))
}

/** Encrypt a JSON-serialisable object into a SecurePayload. */
export async function encryptJSON(key: CryptoKey, salt: Uint8Array, obj: unknown): Promise<SecurePayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(obj))
  )
  return { v: 1, salt: bufToB64(salt), iv: bufToB64(iv), ct: bufToB64(ct) }
}

/** Encrypt using a key whose salt we already know (re-saving an unlocked vault). */
export async function encryptWithSalt(key: CryptoKey, saltB64: string, obj: unknown): Promise<SecurePayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(obj))
  )
  return { v: 1, salt: saltB64, iv: bufToB64(iv), ct: bufToB64(ct) }
}

/**
 * Decrypt a SecurePayload. Throws if the key (passcode) is wrong — AES-GCM's
 * authentication tag fails on a bad key, which we treat as "incorrect passcode".
 */
export async function decryptJSON<T = unknown>(key: CryptoKey, payload: SecurePayload): Promise<T> {
  const iv = b64ToBuf(payload.iv)
  const ct = b64ToBuf(payload.ct)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return JSON.parse(dec.decode(plain)) as T
}
