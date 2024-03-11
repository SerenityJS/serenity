import { DisconnectReason, Packet, PlayerStatus } from "@serenityjs/protocol";

import { NetworkBound, type NetworkPacketEvent } from "../network";
import { HookMethod } from "../types";

import { AbstractEvent } from "./abstract-event";

import type { Player } from "../player";
import type { Serenity } from "../serenity";
import type { PlayStatus } from "@serenityjs/protocol";

class PlayerJoined extends AbstractEvent {
	public static serenity: Serenity;
	public static readonly hook = Packet.PlayStatus;
	public static readonly method = HookMethod.After;

	public readonly player: Player;

	public constructor(player: Player) {
		super();
		this.player = player;
	}

	public static logic(data: NetworkPacketEvent<PlayStatus>): void {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Check if the player's status is login success.
		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (
			packet.status !== PlayerStatus.LoginSuccess ||
			bound !== NetworkBound.Client
		)
			return;

		// First we need to check if their is a player instance.
		if (!session.player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${session.identifier.address}:${session.identifier.port}! PlayerJoined.logic()`
			);
		}

		// Declare the player.
		const player = session.player;

		// Emit the new player event.
		// Await the event to ensure that no data was changed.
		const value = this.serenity.emit("PlayerJoined", new this(player));

		// If the value is false, the event was cancelled.
		// In this case, we will disconnect the player.
		if (!value) {
			return session.disconnect(
				"You were kicked from the server.",
				DisconnectReason.Kicked
			);
		}

		// Log the player's join.
		this.serenity.logger.info(`${player.username} joined the game.`);

		player.dimension.world.sendMessage(`§e${player.username} joined the game.`);
	}
}

export { PlayerJoined };
