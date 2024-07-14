/**
 * Raknet protocol version.
 */
const RAKNET_PROTOCOL = 11;

/**
 * The tick rate of the Raknet protocol.
 */
const RAKNET_TPS = 100;
/**
 * The length of a Raknet tick in seconds.
 */
const RAKNET_TICK_LEN = 1 / RAKNET_TPS;

/**
 * The size of a UDP header.
 */
const UDP_HEADER_SIZE = 28;

/**
 * The minimum size of a Raknet packet.
 */
const MIN_MTU_SIZE = 400;

/**
 * The maximum size of a Raknet packet.
 */
const MAX_MTU_SIZE = 1492;

/**
 * The size of a Raknet datagram header.
 */
const DGRAM_HEADER_SIZE = 4;

/**
 * The overhead of a Raknet datagram.
 */
const DGRAM_MTU_OVERHEAD = 36;

export {
	RAKNET_PROTOCOL,
	RAKNET_TPS,
	RAKNET_TICK_LEN,
	UDP_HEADER_SIZE,
	MIN_MTU_SIZE,
	MAX_MTU_SIZE,
	DGRAM_HEADER_SIZE,
	DGRAM_MTU_OVERHEAD
};
