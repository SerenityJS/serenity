import { type KeyObject, sign, verify } from "node:crypto";

import type { SdpFingerprint } from "../types";

/**
 * The JWS algorithms NetherNet identities use, by the named curve of their key.
 */
const ALGORITHMS: Record<string, { alg: string; hash: string }> = {
  prime256v1: { alg: "ES256", hash: "sha256" },
  secp384r1: { alg: "ES384", hash: "sha384" },
  secp521r1: { alg: "ES512", hash: "sha512" }
};

/**
 * Encodes data as unpadded base64url.
 * @param data The data to encode.
 * @returns The encoded data.
 */
function base64url(data: Buffer | string): string {
  return Buffer.from(data).toString("base64url");
}

/**
 * Gets the JWS algorithm and hash of an EC key.
 * @param key The key to get the algorithm of.
 * @returns The algorithm and hash of the key.
 */
function getAlgorithm(key: KeyObject): { alg: string; hash: string } {
  const curve = key.asymmetricKeyDetails?.namedCurve ?? "";
  const algorithm = ALGORITHMS[curve];

  if (key.asymmetricKeyType !== "ec" || !algorithm)
    throw new Error(
      `Unsupported identity key: ${key.asymmetricKeyType} ${curve}`
    );

  return algorithm;
}

/**
 * Serializes DTLS fingerprints as the canonical JSON signed by identity assertions.
 * Keys are sorted and there is no insignificant whitespace, so both peers produce identical bytes.
 * @param fingerprints The fingerprints to serialize.
 * @returns The canonical JSON of the fingerprints.
 */
function canonicalFingerprints(fingerprints: Array<SdpFingerprint>): string {
  return JSON.stringify({
    fingerprint: fingerprints.map(({ algorithm, digest }) => ({
      algorithm,
      digest
    }))
  });
}

/**
 * Signs a payload as a compact JWS.
 * @param payload The payload to sign.
 * @param key The EC private key to sign with.
 * @param header Extra JWS header parameters.
 * @param detached Whether to omit the payload from the result.
 * @returns The compact JWS.
 */
function signJws(
  payload: string,
  key: KeyObject,
  header: Record<string, unknown> = {},
  detached = false
): string {
  const { alg, hash } = getAlgorithm(key);

  // Build the signing input from the encoded header and payload
  const encodedHeader = base64url(JSON.stringify({ alg, ...header }));
  const encodedPayload = base64url(payload);
  const input = `${encodedHeader}.${encodedPayload}`;

  // JWS uses the raw r || s form of ECDSA signatures
  const signature = sign(hash, Buffer.from(input), {
    key,
    dsaEncoding: "ieee-p1363"
  });

  return `${encodedHeader}.${detached ? "" : encodedPayload}.${base64url(signature)}`;
}

/**
 * Verifies a compact JWS, optionally with a detached payload.
 * @param jws The compact JWS to verify.
 * @param key The EC public key to verify with.
 * @param payload The detached payload, if the JWS omits it.
 * @returns Whether the signature is valid.
 */
function verifyJws(jws: string, key: KeyObject, payload?: string): boolean {
  const parts = jws.split(".");
  if (parts.length !== 3) return false;

  const [encodedHeader, encodedPayload, encodedSignature] = parts as [
    string,
    string,
    string
  ];

  // The algorithm of the header must be the one of the key
  const { alg, hash } = getAlgorithm(key);
  const header = JSON.parse(
    Buffer.from(encodedHeader, "base64url").toString()
  ) as { alg?: string };
  if (header.alg !== alg) return false;

  // Rebuild the signing input, using the detached payload if one was given
  const body = payload === undefined ? encodedPayload : base64url(payload);
  const input = `${encodedHeader}.${body}`;

  return verify(
    hash,
    Buffer.from(input),
    { key, dsaEncoding: "ieee-p1363" },
    Buffer.from(encodedSignature, "base64url")
  );
}

/**
 * Decodes the claims of a JWT, without verifying its signature.
 * @param token The JWT to decode.
 * @returns The claims of the JWT.
 */
function decodeJwt(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT");

  const claims = JSON.parse(Buffer.from(parts[1]!, "base64url").toString());
  if (typeof claims !== "object" || claims === null)
    throw new Error("Malformed JWT claims");

  return claims as Record<string, unknown>;
}

export { base64url, canonicalFingerprints, signJws, verifyJws, decodeJwt };
