import {
	DisconnectReason,
	Packet,
	PlayStatus,
	type PlayStatusPacket
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";

import type { Serenity } from "../serenity";
import type { Player } from "@serenityjs/world";

class PlayerJoinedSignal extends EventSignal {
	public static serenity: Serenity;
	public static readonly hook = Packet.PlayStatus;

	public readonly player: Player;

	public constructor(player: Player) {
		super();
		this.player = player;
	}

	public static logic(data: NetworkPacketEvent<PlayStatusPacket>): boolean {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Check if the player's status is login success.
		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (
			packet.status !== PlayStatus.LoginSuccess ||
			bound !== NetworkBound.Client
		)
			return true;

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

		// Emit the PlayerJoined event.
		const value = this.serenity.emit(
			"PlayerJoined",
			new PlayerJoinedSignal(player)
		);

		// Check if the event was cancelled.
		if (!value) {
			session.disconnect(
				"You were disconnected from the server.",
				DisconnectReason.Kicked
			);

			return false;
		}

		// Log the player's join message.
		player.dimension.world.logger.info(
			`${player.username} has joined the game.`
		);

		// Return true to continue the event.
		return true;
	}
}

export { PlayerJoinedSignal };
