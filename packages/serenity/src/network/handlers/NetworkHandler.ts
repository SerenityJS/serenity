import type { DataPacket } from '@serenityjs/bedrock-protocol';
import type { NetworkSession, Serenity } from '../..';

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
