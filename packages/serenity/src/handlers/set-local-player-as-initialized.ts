import {
	DisconnectReason,
	SetLocalPlayerAsInitializedPacket
} from "@serenityjs/protocol";
import { PlayerInitializeSignal } from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class SetLocalPlayerAsIntialized extends SerenityHandler {
	public static readonly packet = SetLocalPlayerAsInitializedPacket.id;

	public static handle(
		_packet: SetLocalPlayerAsInitializedPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Delete the player from the connecting map
		if (this.serenity.connecting.has(session))
			this.serenity.connecting.delete(session);

		// Create a new PlayerInitializeSignal
		const signal = new PlayerInitializeSignal(player);
		const value = signal.emit();

		// Check if the signal was cancelled
		if (value === false) return;

		// Spawn the player
		player.spawn();

		// Send the player joined message
		player.dimension.world.sendMessage(
			`§e${player.username} joined the game.§r`
		);

		// Log the player joined message
		player.dimension.world.logger.info(
			`§8[§9${player.username}§8] Event:§r Player has joined the game.`
		);
	}
}

export { SetLocalPlayerAsIntialized };
