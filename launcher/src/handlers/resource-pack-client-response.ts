import {
	ResourcePackClientResponsePacket,
	ResourcePackResponse,
	ResourcePackStackPacket,
	MINECRAFT_VERSION,
	StartGamePacket,
	PermissionLevel,
	Gamemode,
	Difficulty,
	DimensionType,
	Vector3f,
	CreativeContentPacket,
	BiomeDefinitionListPacket,
	PlayStatusPacket,
	PlayStatus,
	DisconnectReason,
	BlockProperties
} from "@serenityjs/protocol";
import { NetworkSession } from "@serenityjs/network";
import { BIOME_DEFINITION_LIST } from "@serenityjs/data";
import {
	CustomBlockType,
	EntityAlwaysShowNametagComponent,
	EntityNametagComponent
} from "@serenityjs/world";
import { CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";

import { SerenityHandler } from "./serenity-handler";

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
				return this.network.logger.error(
					`ResourcePackResponse.Refused is not implemented!`
				);
			}

			case ResourcePackResponse.SendPacks: {
				return this.network.logger.error(
					`ResourcePackResponse.SendPacks is not implemented!`
				);
			}

			case ResourcePackResponse.HaveAllPacks: {
				// Create a new ResourcePackStackPacket
				const stack = new ResourcePackStackPacket();
				stack.mustAccept = false;
				stack.behaviorPacks = [];
				stack.texturePacks = [];
				stack.gameVersion = MINECRAFT_VERSION;
				stack.experiments = [];
				stack.experimentsPreviouslyToggled = false;

				// Send the packet
				return session.send(stack);
			}

			case ResourcePackResponse.Completed: {
				const nbt = new CompoundTag("", {});
				nbt.addTag(new IntTag("client_prediction_overrides", 0));

				const menu_category = new CompoundTag("menu_category", {});
				menu_category.addTag(new StringTag("category", "construction"));
				// menu_category.addTag(new StringTag("group", "itemGroup.name.concrete"));
				// menu_category.addTag(new ByteTag("is_hidden_in_commands", 0));

				nbt.addTag(menu_category);

				nbt.addTag(new IntTag("molangVersion", 0));

				const vanilla_block_data = new CompoundTag("vanilla_block_data", {});
				vanilla_block_data.addTag(new IntTag("block_id", 10_000));
				// vanilla_block_data.addTag(new StringTag("material", "dirt"));

				nbt.addTag(vanilla_block_data);

				const blocks: Array<BlockProperties> = player.dimension.world.blocks
					.getCustomBlocks()
					.map((block) => {
						const nbt = CustomBlockType.getBlockProperty(block);

						return {
							name: block.identifier,
							nbt: nbt
						};
					});

				const packet = new StartGamePacket();
				packet.entityId = player.unique;
				packet.runtimeEntityId = player.runtime;
				packet.playerGamemode = 1;
				packet.playerPosition = new Vector3f(0, -58, 0);
				packet.pitch = 0;
				packet.yaw = 0;
				packet.seed = BigInt(0);
				packet.biomeType = 0;
				packet.biomeName = "plains";
				packet.dimension = DimensionType.Overworld;
				packet.generator = 1;
				packet.worldGamemode = Gamemode.Creative;
				packet.difficulty = Difficulty.Easy;
				packet.spawnPosition = {
					x: 0,
					y: 0,
					z: 0
				};
				packet.achievementsDisabled = true;
				packet.editorWorldType = 0;
				packet.createdInEdior = false;
				packet.exportedFromEdior = false;
				packet.dayCycleStopTime = 0;
				packet.eduOffer = 0;
				packet.eduFeatures = false;
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
						value: false
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
				packet.permissionLevel = PermissionLevel.Member;
				packet.serverChunkTickRange = 0;
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
				packet.gameVersion = "*";
				packet.limitedWorldWidth = 16;
				packet.limitedWorldLength = 16;
				packet.isNewNether = false;
				packet.eduResourceUriButtonName = "";
				packet.eduResourceUriLink = "";
				packet.experimentalGameplayOverride = false;
				packet.chatRestrictionLevel = 0;
				packet.disablePlayerInteractions = false;
				packet.levelId = "SerenityJS";
				packet.worldName = player.dimension.world.identifier;
				packet.premiumWorldTemplateId = "00000000-0000-0000-0000-000000000000";
				packet.isTrial = false;
				packet.movementAuthority = 0;
				packet.rewindHistorySize = 0;
				packet.serverAuthoritativeBlockBreaking = true;
				packet.currentTick = 0n;
				packet.enchantmentSeed = 0;
				packet.blockProperties = blocks;
				packet.items = [];
				packet.multiplayerCorrelationId = "<raknet>a555-7ece-2f1c-8f69";
				packet.serverAuthoritativeInventory = true;
				packet.engine = "*";
				packet.propertyData1 = 0x0a;
				packet.propertyData2 = 0x00;
				packet.propertyData3 = 0x00;
				packet.blockPaletteChecksum = 0n;
				packet.worldTemplateId = "00000000000000000000000000000000";
				packet.clientSideGeneration = true;
				packet.blockNetworkIdsAreHashes =
					player.dimension.world.provider.hashes;
				packet.serverControlledSounds = false;

				const biomes = new BiomeDefinitionListPacket();
				biomes.biomes = BIOME_DEFINITION_LIST;

				const content = new CreativeContentPacket();
				content.items = [
					{
						network: 10_000,
						blockRuntimeId: 0,
						metadata: 0,
						stackSize: 1
					},
					...player.dimension.world.items.creative
				];

				const status = new PlayStatusPacket();
				status.status = PlayStatus.PlayerSpawn;

				session.sendImmediate(packet, biomes, content, status);

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
			}
		}
	}
}

export { ResourcePackClientResponse };
