import "server-only";
import crypto from "crypto";

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let result = "";
  let bitsLeft = 0;
  let current = 0;
  for (const byte of buf) {
    current = (current << 8) | byte;
    bitsLeft += 8;
    while (bitsLeft >= 5) {
      result += BASE32_CHARS[(current >>> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  if (bitsLeft > 0) {
    result += BASE32_CHARS[(current << (5 - bitsLeft)) & 31];
  }
  return result;
}

function base32Decode(str: string): Buffer {
  const cleaned = str.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of cleaned) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function getTotpAtCounter(secret: string, counter: number): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const key = base32Decode(secret);
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(counterBuf);
  const hash = hmac.digest();

  const offset = hash[19] & 0xf;
  const code =
    (((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)) %
    1_000_000;
  return code.toString().padStart(6, "0");
}

export function verifyTotp(secret: string, token: string): boolean {
  const counter = Math.floor(Date.now() / 30_000);
  for (let delta = -1; delta <= 1; delta++) {
    if (getTotpAtCounter(secret, counter + delta) === token) return true;
  }
  return false;
}

export function generateMfaSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function getTotpUri(secret: string, email: string, issuer = "RMS Super Admin"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
