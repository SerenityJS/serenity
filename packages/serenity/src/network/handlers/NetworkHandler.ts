import type { DataPacket, Packet } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../../Serenity';
import type { NetworkSession } from '../Session';

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
	public static handle(packet: DataPacket, session: NetworkSession): void {
		throw new Error('NetworkHandler.handle() is not implemented!');
	}
}

export { NetworkHandler };
