import { DisconnectReason, Packet } from "@serenityjs/protocol";

import { NetworkBound, type NetworkPacketEvent } from "../network";
import { HookMethod } from "../types";

import { AbstractEvent } from "./abstract-event";

import type { Player } from "../player";
import type { Serenity } from "../serenity";
import type { Disconnect } from "@serenityjs/protocol";

class PlayerLeft extends AbstractEvent {
	public static serenity: Serenity;

	public static readonly hook = Packet.Disconnect;
	public static readonly method = HookMethod.After;

	public readonly player: Player;

	public constructor(player: Player) {
		super();
		this.player = player;
	}

	public static logic(data: NetworkPacketEvent<Disconnect>): void {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Check if the disconnect reason is "disconnected".
		// Also check if the packet is incoming. Meaning the packet is being sent to by client.
		if (
			packet.reason !== DisconnectReason.Disconnected ||
			bound !== NetworkBound.Server
		)
			return;

		// First we need to check if their is a player instance.
		if (!session.player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${session.identifier.address}:${session.identifier.port}! PlayerLeft.logic()`
			);
		}

		// Declare the player.
		const player = session.player;

		// Emit the new player event.
		// Which in this case, it doesn't matter if the data was changed.
		const value = this.serenity.emit("PlayerLeft", new PlayerLeft(player));

		// If the value is false, the event was cancelled.
		// In this case, we will log an error.
		// We can't disconnect the player since they already disconnected.
		if (!value) {
			return this.serenity.logger.error(
				"PlayerLeft event can not be cancelled, the player has already terminated the connection."
			);
		}

		// Log the player leaving.
		this.serenity.logger.info(
			`${player.username} (${player.xuid}) left the game.`
		);

		// Send a message to all players.
		this.serenity.getWorld().sendMessage(`§e${player.username} left the game.`);
	}
}

export { PlayerLeft };
