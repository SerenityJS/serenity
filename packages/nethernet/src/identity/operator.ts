import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  type KeyObject
} from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { getFingerprints } from "../sdp";

import { canonicalFingerprints, signJws } from "./jws";

import type { IdentityEnvelope } from "../types";

/**
 * The time in seconds an operator token stays valid.
 */
const TOKEN_LIFETIME = 60 * 60;

/**
 * The time in seconds after which a new operator token is issued.
 */
const TOKEN_REFRESH = 10 * 60;

/**
 * The long-lived identity of the server operator, asserted in every SDP answer.
 * Clients that signal over plain HTTP pin its public key the first time they join (trust on first use),
 * so the key is persisted and should only change deliberately.
 */
class OperatorIdentity {
  /**
   * The private key of the operator.
   */
  public readonly privateKey: KeyObject;

  /**
   * The public key of the operator, embedded in its token as the `cpk` claim.
   */
  public readonly publicKey: KeyObject;

  /**
   * The domain clients may show next to the key.
   */
  public readonly domain: string;

  /**
   * The current operator token.
   */
  protected token: string | null = null;

  /**
   * The time in seconds the current token was issued at.
   */
  protected issuedAt = 0;

  /**
   * Creates a new operator identity.
   * @param privateKey The EC private key of the operator.
   * @param domain The domain clients may show next to the key.
   */
  public constructor(privateKey: KeyObject, domain: string) {
    this.privateKey = privateKey;
    this.publicKey = createPublicKey(privateKey);
    this.domain = domain;
  }

  /**
   * The SHA-256 fingerprint of the operator public key, which operators can publish so players can verify the key.
   */
  public get fingerprint(): string {
    const der = this.publicKey.export({ type: "spki", format: "der" });

    return "sha256:" + createHash("sha256").update(der).digest("hex");
  }

  /**
   * Gets the operator token, issuing a new one when the current one is due for refresh.
   * The token is self-signed and holds the operator public key as a JSON Web Key in its `cpk` claim.
   * @returns The operator token.
   */
  public getToken(): string {
    const now = Math.floor(Date.now() / 1000);

    // Return the current token if it is still fresh
    if (this.token && now - this.issuedAt < TOKEN_REFRESH) return this.token;

    // Vanilla servers also carry the DER public key in the x5u header
    const x5u = this.publicKey
      .export({ type: "spki", format: "der" })
      .toString("base64");

    // Issue a new token holding the public key as a JSON Web Key
    const claims = {
      cpk: this.publicKey.export({ format: "jwk" }),
      iat: now,
      exp: now + TOKEN_LIFETIME
    };

    this.token = signJws(JSON.stringify(claims), this.privateKey, { x5u });
    this.issuedAt = now;

    return this.token;
  }

  /**
   * Creates the `a=identity` attribute value asserting the operator identity for an SDP answer.
   * @param sdp The SDP answer, holding the DTLS fingerprints to sign.
   * @returns The base64 encoded identity envelope.
   */
  public assert(sdp: string): string {
    const fingerprints = getFingerprints(sdp);
    if (fingerprints.length === 0)
      throw new Error("The SDP answer has no DTLS fingerprint to assert.");

    // Sign the fingerprints with a detached JWS, the client rebuilds the payload from the SDP
    const signature = signJws(
      canonicalFingerprints(fingerprints),
      this.privateKey,
      {},
      true
    );

    // The assertion is itself serialized JSON inside the envelope
    const envelope: IdentityEnvelope = {
      idp: { domain: this.domain, protocol: "default" },
      assertion: JSON.stringify({
        token: this.getToken(),
        fingerprints: signature
      })
    };

    return Buffer.from(JSON.stringify(envelope)).toString("base64");
  }

  /**
   * Loads the operator identity from a PEM file, generating and saving a new key if there is none.
   * @param path The path of the PEM file, or null to generate a key that is not saved.
   * @param domain The domain clients may show next to the key.
   * @returns The operator identity, and whether its key was generated.
   */
  public static load(
    path: string | null,
    domain: string
  ): { identity: OperatorIdentity; generated: boolean } {
    // Read the existing key if there is one
    if (path && existsSync(resolve(path))) {
      const key = createPrivateKey(readFileSync(resolve(path)));

      return { identity: new OperatorIdentity(key, domain), generated: false };
    }

    // Generate a new P-384 key, the curve vanilla uses for NetherNet identities
    const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-384" });

    // Save the key so players keep trusting the server across restarts
    if (path) {
      const pem = privateKey.export({ type: "pkcs8", format: "pem" });
      writeFileSync(resolve(path), pem, { mode: 0o600 });
    }

    return {
      identity: new OperatorIdentity(privateKey, domain),
      generated: true
    };
  }
}

export { OperatorIdentity };
