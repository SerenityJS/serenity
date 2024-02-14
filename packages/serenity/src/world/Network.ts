import type { DataPacket } from '@serenityjs/bedrock-protocol';
import type { World } from './World';

/**
 * The world network class.
 */
class WorldNetwork {
	protected readonly world: World;

	public constructor(world: World) {
		this.world = world;
	}

	/**
	 * Broadcast a packet to all players in the world.
	 *
	 * @param packets - The packets to broadcast.
	 */
	public async broadcast(...packets: DataPacket[]): Promise<void> {
		// Loop through each player.
		for (const player of this.world.players.values()) {
			// Send the packet to that player.
			await player.session.send(...packets);
		}
	}

	/**
	 * Broadcast a packet to all players in the world immediately.
	 *
	 * @param packets - The packets to broadcast.
	 */
	public async broadcastImmediate(...packets: DataPacket[]): Promise<void> {
		// Loop through each player.
		for (const player of this.world.players.values()) {
			// Send the packet to that player.
			await player.session.sendImmediate(...packets);
		}
	}
}

export { WorldNetwork };
