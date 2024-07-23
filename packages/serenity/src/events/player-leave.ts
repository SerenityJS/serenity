import {
	type DisconnectReason,
	Packet,
	type DisconnectPacket
} from "@serenityjs/protocol";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { NetworkPacketEvent } from "@serenityjs/network";
import type { Serenity } from "../serenity";
import type { Player } from "@serenityjs/world";

/**
 * The player leave signal.
 * @note This signal is emitted after the player has left the game. Before hooking will not trigger any effects.
 */
class PlayerLeaveSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.Disconnect;

	public static readonly priority = EventPriority.Before;

	/**
	 * The player that joined the game.
	 */
	public readonly player: Player;

	/**
	 * The reason for the player disconnect
	 */
	public readonly reason: DisconnectReason;

	/**
	 * The message to display when the player disconnects
	 */
	public readonly message: string;

	/**
	 * Constructs a new player leave signal instance.
	 * @param player The player that left the game.
	 * @param reason The reason for the player disconnect
	 * @param message The message to display when the player disconnects
	 */
	public constructor(
		player: Player,
		reason: DisconnectReason,
		message: string
	) {
		super();
		this.player = player;
		this.reason = reason;
		this.message = message;
	}

	public static logic(data: NetworkPacketEvent<DisconnectPacket>): boolean {
		// Separate the data into variables.
		const { session, packet } = data;

		// Get the player from the session.
		// If there is no player, then ignore the signal.
		const player = this.serenity.getPlayer(session);
		if (!player) return true;

		// Create a new signal instance
		const signal = new this(player, packet.reason, packet.message);

		// Emit the signal
		return this.serenity.emit("PlayerLeave", signal);
	}
}

export { PlayerLeaveSignal };
