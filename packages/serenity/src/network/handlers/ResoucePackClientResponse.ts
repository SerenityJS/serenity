import type { ChunkCoord } from '@serenityjs/bedrock-protocol';
import {
	ResourceStatus,
	ResourcePackStack,
	PlayStatus,
	PlayerStatus,
	NetworkChunkPublisherUpdate,
	ResourcePackClientResponse,
} from '@serenityjs/bedrock-protocol';
import type { ChunkColumn } from '../../world';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class ResourcePackClientResponseHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = ResourcePackClientResponse.ID;

	public static override async handle(packet: ResourcePackClientResponse, session: NetworkSession): Promise<void> {
		// TODO: Add support for resource packs.
		// For now, we will just send the empty response.
		// And once we get a completed response, we will send the start the spawn sequence.
		switch (packet.status) {
			case ResourceStatus.None: {
				throw new Error('ResourceStatus.None is not implemented!');
			}

			case ResourceStatus.Refused: {
				throw new Error('ResourceStatus.Refused is not implemented!');
			}

			case ResourceStatus.SendPacks: {
				throw new Error('ResourceStatus.SendPacks is not implemented!');
			}

			case ResourceStatus.HaveAllPacks: {
				// Send the ResourcePackStack packet which contains the resource packs.
				const stack = new ResourcePackStack();
				stack.mustAccept = false;
				stack.behaviorPacks = [];
				stack.texturePacks = [];
				stack.gameVersion = this.serenity.version;
				stack.experiments = [];
				stack.experimentsPreviouslyToggled = false;

				// Now we will send the ResourcePackStack packet to the client.
				return session.send(stack);
			}

			case ResourceStatus.Completed: {
				const player = session.getPlayerInstance(); // TEMP

				if (!player) return; // TEMP

				await session.sendStartGame();

				session.getPlayerInstance()!.abilities.setDefaults();
				session.getPlayerInstance()!.attributes.setDefaults();

				await session.sendCreativeContent();

				await session.sendBiomeDefinitionList();

				const minX = 0 - 4;
				const maxX = 0 + 4;
				const minZ = 0 - 4;
				const maxZ = 0 + 4;

				const sendQueue: ChunkColumn[] = [];
				for (let chunkX = minX; chunkX <= maxX; ++chunkX) {
					for (let chunkZ = minZ; chunkZ <= maxZ; ++chunkZ) {
						// TODO: vanilla does not send all of them, but in a range
						// for example it does send them from x => [-3; 3] and z => [-3; 2]
						sendQueue.push(this.serenity.world.getChunk(chunkX, chunkZ));
					}
				}

				// Map chunks into the publisher update
				const savedChunks: ChunkCoord[] = sendQueue.map((chunk) => {
					return { x: chunk.x, z: chunk.z };
				});

				const radMul = 4;

				const update = new NetworkChunkPublisherUpdate();
				update.coordinate = { x: 0, y: 0, z: 0 };
				update.radius = radMul << 4;
				update.savedChunks = savedChunks;

				await session.send(update);

				for (const chunk of sendQueue) {
					player.render.sendChunk(chunk);
				}

				const status = new PlayStatus();
				status.status = PlayerStatus.PlayerSpawn;

				await session.send(status);
			}
		}
	}
}

export { ResourcePackClientResponseHandler };
