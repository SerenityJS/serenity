import { BlockPickRequest, DisconnectReason } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class BlockPickRequestHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = BlockPickRequest.ID;

	public static override async handle(packet: BlockPickRequest, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		const block = this.serenity.world.getBlock(packet.x, packet.y, packet.z);

		// this.serenity.logger.debug(
		// 	`${player.username} BlockPickRequest: "${player.world.mappings.getBlockName(block)}" at ${packet.x}, ${
		// 		packet.y
		// 	}, ${packet.z}`,
		// );
	}
}

export { BlockPickRequestHandler };
