import type {Buffer} from "node:buffer";
import type { DataPacket } from '@serenityjs/bedrock-protocol';
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
	 * Handles a packet.
	 *
	 * @param packet The packet to handle.
	 * @param session The network session.
	 */
	public static handle(packet: DataPacket, session: NetworkSession, raw?: Buffer): void {
		throw new Error('NetworkHandler.handle() is not implemented!');
	}
}

export { NetworkHandler };
