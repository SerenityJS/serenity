import {
	DisconnectReason,
	type PlayerActionPacket,
	Packet,
	ActionIds,
	Gamemode
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { Serenity } from "../serenity";
import type { Block, Player } from "@serenityjs/world";

class PlayerStartedBreakingBlockSignal extends EventSignal {
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
	 * The player that started breaking the block.
	 */
	public readonly player: Player;

	/**
	 * The block that is being broken.
	 */
	public readonly block: Block;

	/**
	 * Constructs a new player started breaking block signal.
	 * @param player The player that started breaking the block.
	 * @param block The block that is being broken.
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

		// Check if the action is not breaking a block
		if (packet.action !== ActionIds.StartBreak) return true;

		// Check if the player is in creative mode.
		if (player.gamemode === Gamemode.Creative) return true;

		// Get the block that the player is breaking.
		const { x, y, z } = packet.blockPosition;
		const block = player.dimension.getBlock(x, y, z);

		// Create a new signal and emit it.
		const signal = new this(player, block);

		// Emit the signal.
		return this.serenity.emit("PlayerStartedBreakingBlock", signal);
	}
}

export { PlayerStartedBreakingBlockSignal };
