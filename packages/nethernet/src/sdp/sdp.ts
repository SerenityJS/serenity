import type { SdpFingerprint } from "../types";

/**
 * Splits an SDP into its lines, dropping the trailing empty line.
 * @param sdp The SDP to split.
 * @returns The lines of the SDP.
 */
function splitLines(sdp: string): Array<string> {
  const lines = sdp.split(/\r?\n/);

  // Remove the empty line left by the final line break
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();

  return lines;
}

/**
 * Joins SDP lines back together, with the CRLF line breaks required by RFC 8866.
 * @param lines The lines to join.
 * @returns The SDP.
 */
function joinLines(lines: Array<string>): string {
  return lines.join("\r\n") + "\r\n";
}

/**
 * Gets every DTLS fingerprint of an SDP, in the order they appear.
 * @param sdp The SDP to read.
 * @returns The fingerprints of the SDP.
 */
function getFingerprints(sdp: string): Array<SdpFingerprint> {
  const fingerprints: Array<SdpFingerprint> = [];

  for (const line of splitLines(sdp)) {
    // Fingerprints are formatted as "a=fingerprint:<algorithm> <digest>"
    const match = /^a=fingerprint:(\S+)\s+(\S+)$/.exec(line);
    if (match) fingerprints.push({ algorithm: match[1]!, digest: match[2]! });
  }

  return fingerprints;
}

/**
 * Gets the value of the `a=identity` attribute of an SDP.
 * @param sdp The SDP to read.
 * @returns The value of the attribute, or null if there is none.
 */
function getIdentity(sdp: string): string | null {
  const line = splitLines(sdp).find((x) => x.startsWith("a=identity:"));

  return line ? line.slice("a=identity:".length).trim() : null;
}

/**
 * Removes the `a=identity` attributes of an SDP.
 * WebRTC implementations reject them, so they are removed before the SDP is applied.
 * @param sdp The SDP to strip.
 * @returns The SDP without identity attributes.
 */
function removeIdentity(sdp: string): string {
  return joinLines(
    splitLines(sdp).filter((line) => !line.startsWith("a=identity:"))
  );
}

/**
 * Adds a session level `a=identity` attribute to an SDP, before its first media section.
 * @param sdp The SDP to add the attribute to.
 * @param value The value of the attribute.
 * @returns The SDP with the attribute.
 */
function insertIdentity(sdp: string, value: string): string {
  const lines = splitLines(sdp).filter((x) => !x.startsWith("a=identity:"));

  // Find the first media section, the identity has to come before it
  const media = lines.findIndex((line) => line.startsWith("m="));

  // Insert the identity at the end of the session section
  lines.splice(media === -1 ? lines.length : media, 0, `a=identity:${value}`);

  return joinLines(lines);
}

/**
 * Gets the addresses of the ICE candidates of an SDP.
 * @param sdp The SDP to read.
 * @returns The addresses of the candidates.
 */
function getCandidateAddresses(sdp: string): Set<string> {
  const addresses = new Set<string>();

  for (const line of splitLines(sdp)) {
    // Candidates are formatted as "a=candidate:<foundation> <component> <transport> <priority> <address> <port> typ <type> ..."
    const parts = line.split(" ");
    if (line.startsWith("a=candidate:") && parts.length >= 6)
      addresses.add(parts[4]!.toLowerCase());
  }

  return addresses;
}

/**
 * Adds ICE candidates to the media section of an SDP, ahead of its existing candidates.
 * @param sdp The SDP to add the candidates to.
 * @param candidates The candidate attributes to add, without the `a=` prefix.
 * @returns The SDP with the candidates.
 */
function insertCandidates(sdp: string, candidates: Array<string>): string {
  if (candidates.length === 0) return sdp;

  const lines = splitLines(sdp);
  const attributes = candidates.map((candidate) => `a=${candidate}`);

  // Place the candidates before the existing ones, or before the end of candidates marker
  let index = lines.findIndex((line) => line.startsWith("a=candidate:"));
  if (index === -1)
    index = lines.findIndex((line) => line === "a=end-of-candidates");
  if (index === -1) index = lines.length;

  lines.splice(index, 0, ...attributes);

  return joinLines(lines);
}

export {
  splitLines,
  joinLines,
  getFingerprints,
  getIdentity,
  removeIdentity,
  insertIdentity,
  getCandidateAddresses,
  insertCandidates
};
