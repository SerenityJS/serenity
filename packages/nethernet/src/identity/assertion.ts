import { createPublicKey, type KeyObject } from "node:crypto";

import { getFingerprints, getIdentity } from "../sdp";

import { canonicalFingerprints, decodeJwt, verifyJws } from "./jws";

import type {
  ClientIdentity,
  IdentityAssertion,
  IdentityEnvelope
} from "../types";

/**
 * The maximum length of an `a=identity` attribute value.
 */
const MAX_IDENTITY_LENGTH = 16 * 1024;

/**
 * Parses the `cpk` claim of an identity token into a public key.
 * Clients use a base64 encoded DER SubjectPublicKeyInfo, servers a JSON Web Key.
 * @param claim The value of the claim.
 * @returns The public key.
 */
function parsePublicKey(claim: unknown): KeyObject {
  if (typeof claim === "string")
    return createPublicKey({
      key: Buffer.from(claim, "base64"),
      format: "der",
      type: "spki"
    });

  if (typeof claim === "object" && claim !== null)
    return createPublicKey({ key: claim as never, format: "jwk" });

  throw new Error("The identity token has no public key.");
}

/**
 * Verifies the identity assertion of an SDP offer.
 * The assertion proves that the holder of the token's public key generated the DTLS certificate of the offer,
 * which WebRTC then enforces during the handshake. The token itself is not verified against the issuer here.
 * @param sdp The SDP offer.
 * @returns The identity of the client, or null if the offer has no assertion.
 * @throws If the assertion is malformed or its signature is invalid.
 */
function verifyClientIdentity(sdp: string): ClientIdentity | null {
  const value = getIdentity(sdp);
  if (value === null) return null;

  if (value.length > MAX_IDENTITY_LENGTH)
    throw new Error("The identity assertion is too large.");

  // Decode the envelope and the assertion it holds
  const envelope = JSON.parse(
    Buffer.from(value, "base64").toString()
  ) as Partial<IdentityEnvelope>;

  if (envelope.idp?.protocol !== "default")
    throw new Error("The identity assertion uses an unsupported protocol.");

  if (typeof envelope.assertion !== "string")
    throw new Error("The identity envelope has no assertion.");

  const assertion = JSON.parse(
    envelope.assertion
  ) as Partial<IdentityAssertion>;
  if (
    typeof assertion.token !== "string" ||
    typeof assertion.fingerprints !== "string"
  )
    throw new Error("The identity assertion is malformed.");

  // Read the public key bound to the token
  const claims = decodeJwt(assertion.token);
  const key = parsePublicKey(claims.cpk);

  // Rebuild the signed payload from the DTLS fingerprints of the offer
  const fingerprints = getFingerprints(sdp);
  if (fingerprints.length === 0)
    throw new Error("The SDP offer has no DTLS fingerprint.");

  // The signature over the fingerprints proves possession of the key
  if (
    !verifyJws(assertion.fingerprints, key, canonicalFingerprints(fingerprints))
  )
    throw new Error("The identity assertion signature is invalid.");

  return {
    publicKey: key.export({ type: "spki", format: "der" }).toString("base64"),
    token: assertion.token,
    domain: envelope.idp.domain ?? ""
  };
}

export { verifyClientIdentity };
