async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJSON(data: unknown, password: string): Promise<string> {
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  const key = await deriveKey(password, salt);
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  const buf = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  buf.set(salt, 0);
  buf.set(iv, 16);
  buf.set(new Uint8Array(encrypted), 28);
  return btoa(String.fromCharCode(...buf));
}

export async function decryptJSON<T>(base64: string, password: string): Promise<T> {
  const buf = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const salt = new Uint8Array(buf.buffer.slice(0, 16)) as Uint8Array<ArrayBuffer>;
  const iv = new Uint8Array(buf.buffer.slice(16, 28)) as Uint8Array<ArrayBuffer>;
  const data = buf.slice(28);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}
