import type { DataPacket, Packet } from "@serenityjs/protocol";
import type { Network } from "../network";
import type { NetworkSession } from "../session";

/**
 * Represents a generic network handler.
 *
 * @abstract
 */
abstract class NetworkHandler {
	/**
	 * The network instance.
	 */
	public static network: Network;

	/**
	 * The packet of the network handler.
	 */
	public static packet: Packet;

	/**
	 * Handles a packet.
	 *
	 * @param packet The packet to handle.
	 * @param session The network session.
	 */
	public static handle(_packet: DataPacket, _session: NetworkSession): void {
		throw new Error("NetworkHandler.handle() is not implemented!");
	}
}

export { NetworkHandler };
