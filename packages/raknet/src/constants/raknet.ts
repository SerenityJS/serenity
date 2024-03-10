/**
 * Raknet protocol version.
 */
const Protocol = 11;

/**
 * The tick rate of the Raknet protocol.
 */
const RaknetTPS = 100;
/**
 * The length of a Raknet tick in seconds.
 */
const RaknetTickLength = 1 / RaknetTPS;

/**
 * The size of a UDP header.
 */
const udpHeaderSize = 28;

/**
 * The minimum size of a Raknet packet.
 */
const MinMtuSize = 400;
/**
 * The maximum size of a Raknet packet.
 */
const MaxMtuSize = 1492;

export {
	Protocol,
	RaknetTPS,
	RaknetTickLength,
	udpHeaderSize,
	MinMtuSize,
	MaxMtuSize
};
