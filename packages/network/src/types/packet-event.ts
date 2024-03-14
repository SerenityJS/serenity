import { DataPacket } from "@serenityjs/protocol";

import { NetworkBound } from "../enums";

/**
 * Represents a network packet event.
 */
interface NetworkPacketEvent<T extends DataPacket> {
	/**
	 * The flow direction of the packet.
	 */
	bound: NetworkBound;

	/**
	 * The data packet instance.
	 */
	packet: T;

	/**
	 * The network session instance.
	 */
	session: unknown; // TODO: NetworkSession;
}

export { NetworkPacketEvent };
