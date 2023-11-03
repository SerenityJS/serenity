import type { RequestChunkRadius } from '@serenityjs/protocol';
import { ChunkRadiusUpdate } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class RequestChunkRadiusHandler extends PlayerHandler {
	public static override handle(packet: RequestChunkRadius, player: Player): void {
		// Create a new ChunkRadiusUpdate packet
		const update = new ChunkRadiusUpdate();
		update.radius = player.world.settings.getChunkRadius();
		// Send the packet to the player
		return player.sendPacket(update);
	}
}

export { RequestChunkRadiusHandler };
