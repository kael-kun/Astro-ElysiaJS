export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, [
    "deriveBits",
    "deriveKey",
  ]);

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const rawKey = await crypto.subtle.exportKey("raw", derivedKey);

  // Encode to base64 for storing in DB
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));

  return `${saltBase64}:${keyBase64}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();

  const [saltBase64, keyBase64] = storedHash.split(":");

  const salt = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));
  const storedKey = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));

  // Re-derive key using same salt
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, [
    "deriveBits",
    "deriveKey",
  ]);

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", derivedKey));

  // Compare byte-by-byte
  if (rawKey.length !== storedKey.length) return false;

  for (let i = 0; i < rawKey.length; i++) {
    if (rawKey[i] !== storedKey[i]) return false;
  }

  return true;
}
