import {
	DisconnectReason,
	type PlayerActionPacket,
	Packet,
	ActionIds
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { Serenity } from "../serenity";
import type { Block, Player } from "@serenityjs/world";

class PlayerBreakBlockSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.PlayerAction;

	/**
	 * The priority of the event signal.
	 */
	public static readonly priority = EventPriority.Before;

	/**
	 * The player that broke the block.
	 */
	public readonly player: Player;

	/**
	 * The block that was broken.
	 */
	public readonly block: Block;

	/**
	 * Constructs a new player place block after signal instance.
	 * @param player The player that broke the block.
	 * @param block The block that was broken.
	 */
	public constructor(player: Player, block: Block) {
		super();
		this.player = player;
		this.block = block;
	}

	public static logic(data: NetworkPacketEvent<PlayerActionPacket>): boolean {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (bound !== NetworkBound.Server) return true;

		// Get the player from the session.
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player) {
			session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

			return false;
		}

		// Check if the action is not a block break action.
		if (packet.action !== ActionIds.PredictBreak) return true;

		// Get the block from the dimension.
		const { x, y, z } = packet.blockPosition;
		const brokenBlock = player.dimension.getBlock(x, y, z);

		// Emit the signal.
		const value = this.serenity.emit(
			"PlayerBreakBlock",
			new PlayerBreakBlockSignal(player, brokenBlock)
		);

		// Check if the event is cancelled.
		if (value === false) {
			// Replace the block if the event is cancelled.
			brokenBlock.setPermutation(brokenBlock.permutation);

			// Cancel the event.
			return false;
		}

		// Continue the event.
		return true;
	}
}

export { PlayerBreakBlockSignal };
