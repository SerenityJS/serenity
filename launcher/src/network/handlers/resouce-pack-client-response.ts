import {
	ResourceStatus,
	ResourcePackStackPacket,
	PlayStatusPacket,
	PlayStatus,
	ResourcePackClientResponsePacket,
	RespawnState,
	UpdateAdventureSettingsPacket
} from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class ResourcePackClientResponseHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = ResourcePackClientResponsePacket.id;

	public static override async handle(
		packet: ResourcePackClientResponsePacket,
		session: NetworkSession
	): Promise<Promise<void>> {
		// TODO: Add support for resource packs.
		// For now, we will just send the empty response.
		// And once we get a completed response, we will send the start the spawn sequence.
		switch (packet.status) {
			case ResourceStatus.None: {
				throw new Error("ResourceStatus.None is not implemented!");
			}

			case ResourceStatus.Refused: {
				throw new Error("ResourceStatus.Refused is not implemented!");
			}

			case ResourceStatus.SendPacks: {
				throw new Error("ResourceStatus.SendPacks is not implemented!");
			}

			case ResourceStatus.HaveAllPacks: {
				// Send the ResourcePackStack packet which contains the resource packs.
				const stack = new ResourcePackStackPacket();
				stack.mustAccept = false;
				stack.behaviorPacks = [];
				stack.texturePacks = [];
				stack.gameVersion = this.serenity.version;
				stack.experiments = [];
				stack.experimentsPreviouslyToggled = false;

				// Now we will send the ResourcePackStack packet to the client.
				return session.sendImmediate(stack);
			}

			case ResourceStatus.Completed: {
				const player = session.player;

				if (!player) return;

				player.dimension.world.network.sendStartGame(player);

				player.dimension.world.network.sendBiomeDefinitionList(player);

				const settings = new UpdateAdventureSettingsPacket();
				settings.noPvm = false;
				settings.noPvp = false;
				settings.immutableWorld = false;
				settings.showNameTags = true;
				settings.autoJump = true;

				// Set the player abiliry component values.
				for (const component of player.getAbilities()) {
					component.resetToDefaultValue();
				}

				// Set the player attribute component values.
				for (const component of player.getAttributes()) {
					component.resetToDefaultValue();
				}

				// Set the player metadata component values.
				for (const component of player.getMetadata()) {
					component.resetToDefaultValue();
				}

				player.dimension.world.network.sendCreativeContent(player);

				player.respawn(
					player.dimension.spawn,
					RespawnState.ServerSearchingForSpawn
				);
				player.respawn(player.dimension.spawn, RespawnState.ClientReadyToSpawn);
				player.respawn(player.dimension.spawn, RespawnState.ServerReadyToSpawn);

				const status = new PlayStatusPacket();
				status.status = PlayStatus.PlayerSpawn;

				session.send(settings, status);

				const chunks = player.dimension.getSpawnChunks();

				player.sendChunk(...chunks);
			}
		}
	}
}

export { ResourcePackClientResponseHandler };
