import {
	ResourcePackClientResponsePacket,
	ResourcePackResponse,
	ResourcePackStackPacket,
	MINECRAFT_VERSION,
	StartGamePacket,
	Difficulty,
	CreativeContentPacket,
	BiomeDefinitionListPacket,
	ResourcePackDataInfoPacket,
	PlayStatusPacket,
	PlayStatus,
	DisconnectReason,
	type BlockProperties,
	ResourceIdVersions,
	Vector3f
} from "@serenityjs/protocol";
import { BIOME_DEFINITION_LIST } from "@serenityjs/data";
import { CreativeItem, CustomItemType, ItemType } from "@serenityjs/item";
import { CustomBlockType } from "@serenityjs/block";
import { PlayerStatus } from "@serenityjs/world";

import { ResourcePack } from "../resource-packs/resource-pack-manager";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

/**
 * Handles the resource pack client response packet.
 */
class ResourcePackClientResponse extends SerenityHandler {
	public static packet = ResourcePackClientResponsePacket.id;

	public static handle(
		packet: ResourcePackClientResponsePacket,
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

		// Handle the response
		switch (packet.response) {
			case ResourcePackResponse.None: {
				return this.network.logger.error(
					`ResourcePackResponse.None is not implemented!`
				);
			}

			case ResourcePackResponse.Refused: {
				session.disconnect("Refused resource packs.", DisconnectReason.Kicked);

				return this.serenity.logger.info(
					`Disconnected ${player.username} for refusing required resource packs.`
				);
			}

			case ResourcePackResponse.SendPacks: {
				this.serenity.resourcePacks.logger.info(
					`Sending ${player.username} ${packet.packs.length} resource packs...`
				);

				// Loop over all packs and send a data info packet
				for (const packId of packet.packs) {
					const pack = this.serenity.resourcePacks.getPack(packId);

					// In theory this should never happen
					if (!pack) {
						this.serenity.resourcePacks.logger.error(
							`Received request for unknown pack ${packId}.`
						);
						continue;
					}

					const dataInfoPacket = new ResourcePackDataInfoPacket();

					dataInfoPacket.packId = packId;
					dataInfoPacket.maxChunkSize = ResourcePack.MAX_CHUNK_SIZE;
					dataInfoPacket.chunkCount = pack.getChunkCount();
					dataInfoPacket.fileSize = pack.compressedSize;
					dataInfoPacket.fileHash = pack.getHash();
					dataInfoPacket.isPremium = false;
					dataInfoPacket.packType = pack.packType;

					session.send(dataInfoPacket);
				}

				return;
			}

			case ResourcePackResponse.HaveAllPacks: {
				// Create a new ResourcePackStackPacket
				const stack = new ResourcePackStackPacket();
				stack.mustAccept = this.serenity.resourcePacks.mustAcceptResourcePacks;
				stack.behaviorPacks = [];
				stack.gameVersion = MINECRAFT_VERSION;
				stack.experiments = [];
				stack.experimentsPreviouslyToggled = false;
				stack.hasEditorPacks = false;

				stack.texturePacks = [];
				for (const pack of this.serenity.resourcePacks.getPacks()) {
					const packInfo = new ResourceIdVersions(
						pack.name,
						pack.uuid,
						pack.version
					);

					stack.texturePacks.push(packInfo);
				}

				// Send the packet
				return session.send(stack);
			}

			case ResourcePackResponse.Completed: {
				// Set the player as connected
				player.status = PlayerStatus.Connected;

				const blocks: Array<BlockProperties> = CustomBlockType.getAll().map(
					(type) => {
						// Get the item type from the block type
						const item = ItemType.resolve(type) as CustomItemType;

						// Get the block nbt and item nbt
						const blockNbt = type.nbt;
						const itemNbt = CustomItemType.getBlockProperty(item);

						// Add the item block properties to the block type nbt
						for (const tag of itemNbt.getTags()) blockNbt.addTag(tag);

						// const components = new CompoundTag("components", {});

						// for (const component of BlockComponent.registry.get(
						// 	type.identifier
						// ) ?? []) {
						// 	// Check if the component is an NBT component
						// 	if (!(component.prototype instanceof BlockNBTComponent)) continue;

						// 	// Serialize the component
						// 	const serialized = (
						// 		component as typeof BlockNBTComponent
						// 	).serialize() as CompoundTag;

						// 	// Add the component to the components
						// 	components.addTag(serialized);
						// }

						// nbt.addTag(components);

						return {
							name: item.identifier,
							nbt: blockNbt
						};
					}
				);

				const packet = new StartGamePacket();
				packet.entityId = player.unique;
				packet.runtimeEntityId = player.runtime;
				packet.playerGamemode = player.gamemode;
				packet.playerPosition = new Vector3f(0, 6, 0);
				packet.pitch = player.rotation.pitch;
				packet.yaw = player.rotation.yaw;
				packet.seed = BigInt(player.dimension.generator.seed);
				packet.biomeType = 0;
				packet.biomeName = "plains";
				packet.dimension = player.dimension.type;
				packet.generator = 1;
				packet.worldGamemode = player.gamemode;
				packet.hardcore = false;
				packet.difficulty = Difficulty.Easy;
				packet.spawnPosition = player.dimension.spawn;
				packet.achievementsDisabled = true;
				packet.editorWorldType = 0;
				packet.createdInEdior = false;
				packet.exportedFromEdior = false;
				packet.dayCycleStopTime = player.dimension.world.dayTime;
				packet.eduOffer = 0;
				packet.eduFeatures = true;
				packet.eduProductUuid = "";
				packet.rainLevel = 0;
				packet.lightningLevel = 0;
				packet.confirmedPlatformLockedContent = false;
				packet.multiplayerGame = true;
				packet.broadcastToLan = true;
				packet.xblBroadcastMode = 6;
				packet.platformBroadcastMode = 6;
				packet.commandsEnabled = true;
				packet.texturePacksRequired = false;
				packet.gamerules = [
					{
						name: "commandblockoutput",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "dodaylightcycle",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "doentitydrops",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "dofiretick",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "recipesunlock",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "dolimitedcrafting",
						editable: true,
						type: 1,
						value: false
					},
					{
						name: "domobloot",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "domobspawning",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "dotiledrops",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "doweathercycle",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "drowningdamage",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "falldamage",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "firedamage",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "keepinventory",
						editable: true,
						type: 1,
						value: false
					},
					{
						name: "mobgriefing",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "pvp",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "showcoordinates",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "naturalregeneration",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "tntexplodes",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "sendcommandfeedback",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "maxcommandchainlength",
						editable: true,
						type: 2,
						value: 65_535
					},
					{
						name: "doinsomnia",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "commandblocksenabled",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "randomtickspeed",
						editable: true,
						type: 2,
						value: 1
					},
					{
						name: "doimmediaterespawn",
						editable: true,
						type: 1,
						value: false
					},
					{
						name: "showdeathmessages",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "functioncommandlimit",
						editable: true,
						type: 2,
						value: 10_000
					},
					{
						name: "spawnradius",
						editable: true,
						type: 2,
						value: 10
					},
					{
						name: "showtags",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "freezedamage",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "respawnblocksexplode",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "showbordereffect",
						editable: true,
						type: 1,
						value: true
					},
					{
						name: "playerssleepingpercentage",
						editable: true,
						type: 2,
						value: 100
					}
				];
				packet.experiments = [];
				packet.experimentsPreviouslyToggled = false;
				packet.bonusChest = false;
				packet.mapEnabled = false;
				packet.permissionLevel = player.permission;
				packet.serverChunkTickRange = player.dimension.simulationDistance >> 4;
				packet.hasLockedBehaviorPack = false;
				packet.hasLockedResourcePack = false;
				packet.isFromLockedWorldTemplate = false;
				packet.useMsaGamertagsOnly = false;
				packet.isFromWorldTemplate = false;
				packet.isWorldTemplateOptionLocked = false;
				packet.onlySpawnV1Villagers = false;
				packet.personaDisabled = false;
				packet.customSkinsDisabled = false;
				packet.emoteChatMuted = false;
				packet.gameVersion = MINECRAFT_VERSION;
				packet.limitedWorldWidth = 16;
				packet.limitedWorldLength = 16;
				packet.isNewNether = false;
				packet.eduResourceUriButtonName = "";
				packet.eduResourceUriLink = "";
				packet.experimentalGameplayOverride = false;
				packet.chatRestrictionLevel = 0;
				packet.disablePlayerInteractions = false;
				packet.serverIdentfier = "SerenityJS";
				packet.worldIdentifier = player.dimension.world.identifier;
				packet.scenarioIdentifier = "SerenityJS";
				packet.levelId = "SerenityJS";
				packet.worldName = player.dimension.world.identifier;
				packet.premiumWorldTemplateId = "00000000-0000-0000-0000-000000000000";
				packet.isTrial = false;
				packet.movementAuthority = 0;
				packet.rewindHistorySize = 0;
				packet.serverAuthoritativeBlockBreaking = true;
				packet.currentTick = player.dimension.world.currentTick;
				packet.enchantmentSeed = 0;
				packet.blockProperties = blocks;

				// Map the custom items to the packet
				packet.items = ItemType.getAll().map((item) =>
					ItemType.toItemData(item)
				);

				packet.multiplayerCorrelationId = "<raknet>a555-7ece-2f1c-8f69";
				packet.serverAuthoritativeInventory = true;
				packet.engine = "*";
				packet.propertyData1 = 0x0a;
				packet.propertyData2 = 0x00;
				packet.propertyData3 = 0x00;
				packet.blockPaletteChecksum = 0n;
				packet.worldTemplateId = "00000000000000000000000000000000";
				packet.clientSideGeneration = false;
				packet.blockNetworkIdsAreHashes = true;
				packet.serverControlledSounds = true;

				const biomes = new BiomeDefinitionListPacket();
				biomes.biomes = BIOME_DEFINITION_LIST;

				const content = new CreativeContentPacket();
				// content.items = CreativeItems.read(new BinaryStream(CREATIVE_CONTENT));
				content.items = [...CreativeItem.items.values()].map((item) => {
					return {
						network: item.type.network,
						metadata: item.metadata,
						stackSize: 1,
						networkBlockId:
							item.type.block?.permutations[item.metadata]?.network ?? 0,
						extras: {
							canDestroy: [],
							canPlaceOn: [],
							nbt: item.nbt
						}
					};
				});

				const status = new PlayStatusPacket();
				status.status = PlayStatus.PlayerSpawn;

				// Send the spawn sequence
				session.send(packet, biomes, content, status);

				// Spawn the player in the dimension
				player.spawn();

				// Add the player to the connecting map
				this.serenity.connecting.set(player.session, [
					packet,
					biomes,
					content,
					status
				]);
			}
		}
	}
}

export { ResourcePackClientResponse };
