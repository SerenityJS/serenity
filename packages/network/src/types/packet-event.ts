import type { DataPacket } from "@serenityjs/protocol";
import type { NetworkBound } from "../enums";
import type { NetworkSession } from "../session";

interface SessionPacketEvent<T extends DataPacket> {
	/**
	 * The flow direction of the packet.
	 */
	bound: NetworkBound;

	/**
	 * The data packet instance.
	 */
	packet: T;
}

/**
 * Represents a network packet event.
 */
interface NetworkPacketEvent<T extends DataPacket>
	extends SessionPacketEvent<T> {
	/**
	 * The network session instance.
	 */
	session: NetworkSession;
}

export { SessionPacketEvent, NetworkPacketEvent };
