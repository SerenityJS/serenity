/**
 * The default port of a NetherNet server.
 * Signaling is served over TCP, and the WebRTC traffic of every connection is multiplexed over UDP, both on this port.
 */
const DEFAULT_PORT = 19132;

/**
 * The label of the reliable and ordered data channel opened by the client.
 */
const RELIABLE_CHANNEL = "ReliableDataChannel";

/**
 * The label of the unreliable and unordered data channel opened by the client.
 */
const UNRELIABLE_CHANNEL = "UnreliableDataChannel";

/**
 * The maximum SCTP message size advertised in the SDP answer, matching vanilla peers.
 */
const MAX_MESSAGE_SIZE = 262144;

/**
 * The maximum amount of segments a single message can be split into, as the segment header is a uint8.
 */
const MAX_SEGMENTS = 255;

/**
 * The maximum size of a reassembled message, to bound the memory a single connection can hold.
 */
const MAX_REASSEMBLED_SIZE = 16 * 1024 * 1024;

/**
 * The maximum size of an HTTP signaling request body (an SDP offer).
 */
const MAX_SIGNAL_SIZE = 64 * 1024;

/**
 * The maximum amount of pending negotiations a single remote address can have.
 */
const MAX_PENDING_PER_ADDRESS = 4;

/**
 * The path of the HTTP signaling endpoint.
 */
const JOIN_PATH = "/v1/join";

/**
 * The interval in milliseconds at which connections are checked for timeouts.
 */
const TICK_INTERVAL = 1000;

export {
  DEFAULT_PORT,
  RELIABLE_CHANNEL,
  UNRELIABLE_CHANNEL,
  MAX_MESSAGE_SIZE,
  MAX_SEGMENTS,
  MAX_REASSEMBLED_SIZE,
  MAX_SIGNAL_SIZE,
  MAX_PENDING_PER_ADDRESS,
  JOIN_PATH,
  TICK_INTERVAL
};
