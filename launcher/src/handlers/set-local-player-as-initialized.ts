import {
	DisconnectReason,
	SetLocalPlayerAsInitializedPacket
} from "@serenityjs/protocol";
import {
	EntityAlwaysShowNametagComponent,
	EntityNametagComponent
} from "@serenityjs/world";

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

		// Spawn the player in the dimension
		player.spawn();

		// Set the player ability values
		for (const ability of player.getAbilities()) {
			// Reset the ability to the default value
			ability.resetToDefaultValue();
		}

		// Set the player attribute values
		for (const attribute of player.getAttributes()) {
			// Reset the attribute to the default value
			attribute.resetToDefaultValue();
		}

		// Set the player metadata values
		for (const metadata of player.getMetadatas()) {
			// Check if the component is nametag
			// And check for always show nametag
			if (metadata instanceof EntityNametagComponent) {
				// Set the default value to the player's username
				metadata.defaultValue = player.username;
			} else if (metadata instanceof EntityAlwaysShowNametagComponent) {
				// Set the default value to true
				metadata.defaultValue = true;
			}

			// Reset the metadata to the default value
			metadata.resetToDefaultValue();
		}

		// Send the player joined message
		player.dimension.sendMessage(`§e${player.username} joined the game.§r`);

		// Log the player joined message
		player.dimension.world.logger.info(
			`[${player.username}] Event: Player has joined the game.`
		);
	}
}

export { SetLocalPlayerAsIntialized };
