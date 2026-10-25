import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ENCRYPTION_PREFIX = "enc:v1:";

function getEncryptionKey(): Buffer {
    const configuredKey = process.env.AI_KEY_ENCRYPTION_KEY;
    if (!configuredKey) {
        throw new Error("AI_KEY_ENCRYPTION_KEY must be configured to store AI provider credentials.");
    }

    const key = /^[a-f\d]{64}$/i.test(configuredKey)
        ? Buffer.from(configuredKey, "hex")
        : Buffer.from(configuredKey, "base64");
    if (key.length !== 32) {
        throw new Error("AI_KEY_ENCRYPTION_KEY must encode exactly 32 bytes (64 hex characters or base64).");
    }
    return key;
}

export function encryptAiKey(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
    const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${ENCRYPTION_PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptAiKey(value: string): string {
    if (!value.startsWith(ENCRYPTION_PREFIX)) {
        throw new Error("The stored AI provider credential is not encrypted with a supported format.");
    }
    const segments = value.slice(ENCRYPTION_PREFIX.length).split(":");
    const [encodedIv, encodedTag, encodedCiphertext] = segments;
    if (!encodedIv || !encodedTag || !encodedCiphertext) {
        throw new Error("The stored AI provider credential is corrupted.");
    }

    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(encodedIv, "base64"));
    decipher.setAuthTag(Buffer.from(encodedTag, "base64"));
    return Buffer.concat([
        decipher.update(Buffer.from(encodedCiphertext, "base64")),
        decipher.final(),
    ]).toString("utf8");
}
