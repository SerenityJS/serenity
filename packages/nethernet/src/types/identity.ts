/**
 * A DTLS certificate fingerprint, as found in the `a=fingerprint` attributes of an SDP.
 */
interface SdpFingerprint {
  /**
   * The hash algorithm of the fingerprint, such as `sha-256`.
   */
  algorithm: string;

  /**
   * The colon separated hexadecimal digest of the certificate.
   */
  digest: string;
}

/**
 * The JSON envelope carried, base64 encoded, by an `a=identity` attribute.
 */
interface IdentityEnvelope {
  idp: {
    domain: string;
    protocol: string;
  };
  assertion: string;
}

/**
 * The assertion of an identity envelope.
 */
interface IdentityAssertion {
  /**
   * The JWT of the identity, holding its public key in the `cpk` claim.
   */
  token: string;

  /**
   * A detached JWS over the DTLS fingerprints of the SDP, signed by the private key of the `cpk` claim.
   */
  fingerprints: string;
}

/**
 * The identity a client proved in its SDP offer.
 */
interface ClientIdentity {
  /**
   * The public key of the identity, as a base64 encoded DER SubjectPublicKeyInfo.
   * This is the same format as the identity public key of the login packet.
   */
  publicKey: string;

  /**
   * The token of the identity, issued by the Minecraft authentication service.
   * Only its binding to the public key was verified, not its signature.
   */
  token: string;

  /**
   * The domain of the service that issued the token.
   */
  domain: string;
}

export { SdpFingerprint, IdentityEnvelope, IdentityAssertion, ClientIdentity };
