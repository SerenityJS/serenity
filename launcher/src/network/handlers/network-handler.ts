import type { DataPacket, Packet } from "@serenityjs/protocol";
import type { Serenity } from "../../serenity";
import type { NetworkSession } from "../session";

/**
 * Represents a generic network handler.
 *
 * @abstract
 */
abstract class NetworkHandler {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

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
