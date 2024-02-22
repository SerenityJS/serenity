import type { Packet } from '@serenityjs/bedrock-protocol';
import { BlockPickRequest, DisconnectReason } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class BlockPickRequestHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = BlockPickRequest.ID;

	public static override handle(packet: BlockPickRequest, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);
		/*
		// Get the block at the position.
		// And check if the block is null or undefined.
		const block = this.serenity.world.getBlock(packet.x, packet.y, packet.z);
		if (!block) return;

		// Fire the block pick event.
		return block.onBlockPick(player, packet);*/
	}
}

export { BlockPickRequestHandler };
