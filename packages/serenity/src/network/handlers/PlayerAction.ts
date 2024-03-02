import type { Packet } from '@serenityjs/bedrock-protocol';
import {
	PlayerAction,
	DisconnectReason,
	ActionIds,
	Gamemode,
	UpdateBlock,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
} from '@serenityjs/bedrock-protocol';
import { it } from 'node:test';
import type { Player } from '../../index.js';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class PlayerActionHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = PlayerAction.ID;

	public static override handle(packet: PlayerAction, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		switch (packet.action) {
			default:
				this.serenity.logger.debug(`Unhandled PlayerAction: ${ActionIds[packet.action]}`);
				break;

			// Check if a creative player destroys a block.
			// If so, we will handle the block destruction.
			case ActionIds.CreativePlayerDestroyBlock: {
				this.handleCreativePlayerDestroyBlock(packet, player);
				break;
			}
		}
	}

	private static handleCreativePlayerDestroyBlock(packet: PlayerAction, player: Player): void {
		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Get the block from the dimension.
		const block = player.dimension.getBlock(x, y, z);

		// Verify if the player is in creative mode.
		// If not, we will return.
		if (player.gamemode !== Gamemode.Creative) {
			// Create a new UpdateBlock packet.
			const update = new UpdateBlock();
			update.blockRuntimeId = block.permutation.getRuntimeId();
			update.position = { x, y, z };
			update.flags = UpdateBlockFlagsType.Network;
			update.layer = UpdateBlockLayerType.Normal;

			// Send the update to the player.
			return player.session.send(update);
		}

		// Get the minecraft:air permutation.
		const air = player.dimension.world.blocks.resolvePermutation('minecraft:air');

		// Set the block permutation to air.
		player.dimension.setPermutation(x, y, z, air);
	}
}

export { PlayerActionHandler };
