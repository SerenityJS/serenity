import type { ChunkCoord } from '@serenityjs/bedrock-protocol';
import {
	ResourceStatus,
	ResourcePackStack,
	PlayStatus,
	PlayerStatus,
	NetworkChunkPublisherUpdate,
	ResourcePackClientResponse,
} from '@serenityjs/bedrock-protocol';
import type { Chunk } from '../../world/chunk';
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

				const chunks = player.getDimension().getSpawnChunks();

				const update = new NetworkChunkPublisherUpdate();
				update.coordinate = { x: 0, y: 0, z: 0 };
				update.radius = player.getDimension().viewDistance;
				update.savedChunks = chunks.map((chunk: Chunk) => {
					return {
						x: chunk.x,
						z: chunk.z,
					};
				});

				await session.send(update);

				for (const chunk of chunks) {
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
