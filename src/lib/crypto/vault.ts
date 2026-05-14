import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;

function getMasterKey(): Buffer {
  const key = process.env.WALLET_ENCRYPTION_KEY;
  if (!key || key.length < KEY_LENGTH * 2) {
    throw new Error(
      "WALLET_ENCRYPTION_KEY manquante ou trop courte (min 64 hex chars)"
    );
  }
  return Buffer.from(key.slice(0, KEY_LENGTH * 2), "hex");
}

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  tag: string;
}

export function encryptSecretKey(secretKey: string): EncryptedPayload {
  const masterKey = getMasterKey();
  const iv = randomBytes(12);

  const cipher = createCipheriv(ALGORITHM, masterKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(secretKey, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    encryptedData: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decryptSecretKey(payload: EncryptedPayload): string {
  const masterKey = getMasterKey();
  const iv = Buffer.from(payload.iv, "hex");
  const tag = Buffer.from(payload.tag, "hex");
  const encryptedData = Buffer.from(payload.encryptedData, "hex");

  const decipher = createDecipheriv(ALGORITHM, masterKey, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}