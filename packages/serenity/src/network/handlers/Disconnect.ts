import { Disconnect } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class DisconnectHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = Disconnect.ID;

	public static override async handle(packet: Disconnect, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Return if the player is null or undefined.
		if (!player) return;

		// Remove the player from the world.
		player.getWorld().despawnEntity(player);

		// Save the player's properties.
		player.saveProperties();

		// TEMP: Save the dimension chunks
		const world = player.getWorld();
		const dimension = world.getDimension('minecraft:overworld');

		// Write the chunks to the provider.
		world.provider.writeChunks([...dimension.chunks.values()], dimension);
	}
}

export { DisconnectHandler };
