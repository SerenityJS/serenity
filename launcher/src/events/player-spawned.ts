import {
	DisconnectReason,
	Packet,
	type SetLocalPlayerAsInitializedPacket
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";

import type { Serenity } from "../serenity";
import type { Player } from "@serenityjs/world";

class PlayerSpawnedSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.SetLocalPlayerAsInitialized;

	/**
	 * The player that spawned in the world.
	 */
	public readonly player: Player;

	/**
	 * Constructs a new player spawned signal instance.
	 * @param player The player that spawned in the world.
	 */
	public constructor(player: Player) {
		super();
		this.player = player;
	}

	public static logic(
		data: NetworkPacketEvent<SetLocalPlayerAsInitializedPacket>
	): boolean {
		// Separate the data into variables.
		const { session, bound } = data;

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

		// Emit the PlayerSpawned event.
		const value = this.serenity.emit(
			"PlayerSpawned",
			new PlayerSpawnedSignal(player)
		);

		// Check if the event was cancelled.
		if (!value) {
			session.disconnect(
				"You were disconnected from the server.",
				DisconnectReason.Kicked
			);

			return false;
		}

		// Return true to continue the event.
		return true;
	}
}

export { PlayerSpawnedSignal };
