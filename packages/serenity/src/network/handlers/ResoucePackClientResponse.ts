import { Buffer } from 'node:buffer';
import type { ChunkCoord } from '@serenityjs/bedrock-protocol';
import {
	ResourceStatus,
	ResourcePackStack,
	StartGame,
	Gamemode,
	Difficulty,
	PermissionLevel,
	CreativeContent,
	BiomeDefinitionList,
	PlayStatus,
	PlayerStatus,
	NetworkChunkPublisherUpdate,
	Int32,
	NBTTag,
	RequestNetworkSettings,
	ResourcePackClientResponse,
	LevelChunk,
	PlayerList,
	RecordAction,
} from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../../Serenity';
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
				const start = new StartGame();
				start.entityId = session.uniqueId;
				start.runtimeEntityId = session.runtimeId;
				start.playerGamemode = Gamemode.Creative;
				start.playerPosition = { x: 0, y: -46, z: 0 };
				start.rotation = { x: 0, z: 0 };
				start.seed = 0n;
				start.biomeType = 0;
				start.biomeName = 'plains';
				start.dimension = 0;
				start.generator = 1;
				start.worldGamemode = Gamemode.Creative;
				start.difficulty = Difficulty.Normal;
				start.spawnPosition = { x: 0, y: -46, z: 0 };
				start.achievementsDisabled = false;
				start.editorWorldType = 0;
				start.createdInEdior = false;
				start.exportedFromEdior = false;
				start.dayCycleStopTime = 8_250;
				start.eduOffer = 0;
				start.eduFeatures = false;
				start.eduProductUuid = '';
				start.rainLevel = 0;
				start.lightningLevel = 0;
				start.confirmedPlatformLockedContent = false;
				start.multiplayerGame = true;
				start.broadcastToLan = true;
				start.xblBroadcastMode = 6;
				start.platformBroadcastMode = 6;
				start.commandsEnabled = true;
				start.texturePacksRequired = false;
				start.gamerules = [
					{
						name: 'commandblockoutput',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'dodaylightcycle',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'doentitydrops',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'dofiretick',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'recipesunlock',
						editable: true,
						type: 1,
						value: false,
					},
					{
						name: 'dolimitedcrafting',
						editable: true,
						type: 1,
						value: false,
					},
					{
						name: 'domobloot',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'domobspawning',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'dotiledrops',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'doweathercycle',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'drowningdamage',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'falldamage',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'firedamage',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'keepinventory',
						editable: true,
						type: 1,
						value: false,
					},
					{
						name: 'mobgriefing',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'pvp',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'showcoordinates',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'naturalregeneration',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'tntexplodes',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'sendcommandfeedback',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'maxcommandchainlength',
						editable: true,
						type: 2,
						value: 65_535,
					},
					{
						name: 'doinsomnia',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'commandblocksenabled',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'randomtickspeed',
						editable: true,
						type: 2,
						value: 1,
					},
					{
						name: 'doimmediaterespawn',
						editable: true,
						type: 1,
						value: false,
					},
					{
						name: 'showdeathmessages',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'functioncommandlimit',
						editable: true,
						type: 2,
						value: 10_000,
					},
					{
						name: 'spawnradius',
						editable: true,
						type: 2,
						value: 10,
					},
					{
						name: 'showtags',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'freezedamage',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'respawnblocksexplode',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'showbordereffect',
						editable: true,
						type: 1,
						value: true,
					},
					{
						name: 'playerssleepingpercentage',
						editable: true,
						type: 2,
						value: 100,
					},
				];
				start.experiments = [];
				start.experimentsPreviouslyToggled = false;
				start.bonusChest = false;
				start.mapEnabled = false;
				start.permissionLevel = PermissionLevel.Member;
				start.serverChunkTickRange = 4;
				start.hasLockedBehaviorPack = false;
				start.hasLockedResourcePack = false;
				start.isFromLockedWorldTemplate = false;
				start.useMsaGamertagsOnly = false;
				start.isFromWorldTemplate = false;
				start.isWorldTemplateOptionLocked = false;
				start.onlySpawnV1Villagers = false;
				start.personaDisabled = false;
				start.customSkinsDisabled = false;
				start.emoteChatMuted = false;
				start.gameVersion = '*';
				start.limitedWorldWidth = 16;
				start.limitedWorldLength = 16;
				start.isNewNether = false;
				start.eduResourceUriButtonName = '';
				start.eduResourceUriLink = '';
				start.experimentalGameplayOverride = false;
				start.chatRestrictionLevel = 0;
				start.disablePlayerInteractions = false;
				start.levelId = 'level';
				start.worldName = 'name';
				start.premiumWorldTemplateId = '00000000-0000-0000-0000-000000000000';
				start.isTrial = false;
				start.movementAuthority = 0;
				start.rewindHistorySize = 40;
				start.serverAuthoritativeBlockBreaking = false;
				start.currentTick = 0n;
				start.enchantmentSeed = 0;
				start.blockProperties = [];
				start.itemStates = [];
				start.multiplayerCorrelationId = '<raknet>a555-7ece-2f1c-8f69';
				start.serverAuthoritativeInventory = true;
				start.engine = '*';
				start.propertyData1 = 0x0a;
				start.propertyData2 = 0x00;
				start.propertyData3 = 0x00;
				start.blockPaletteChecksum = 0n;
				start.worldTemplateId = '00000000000000000000000000000000';
				start.clientSideGeneration = true;
				start.blockNetworkIdsAreHashes = true; // Important
				start.serverControlledSounds = false;

				await session.send(start);

				session.getPlayerInstance()!.abilities.setDefaults();
				session.getPlayerInstance()!.attributes.setDefaults();

				const content = new CreativeContent();
				content.items = [
					{
						entryId: 1,
						item: {
							networkId: 357,
							count: 1,
							metadata: 0,
							blockRuntimeId: 0,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: true,
								nbt: {
									display: { Name: '§rCustom Item', Lore: ['Data'] },
									ench: [].typeOf(NBTTag.TypedList),
									Trim: { Material: 'netherite', Pattern: 'vex' },
								},
								/* new CompoudValue({
									display: new CompoudValue({
										Name: new StringValue("Some Custom Display Name"),
										Lore: new TypedArrayValue([new StringValue("Custom Lore")], NBTTag.String)
									}),
									Trim: new CompoudValue({
										Material: new StringValue("netherite"),
										Pattern: new StringValue("vex")
									}),
									ench: new TypedArrayValue([
										new CompoudValue({id: new Int16Value(5), lvl: new Int16Value(10)}),
										new CompoudValue({id: new Int16Value(6), lvl: new Int16Value(10)}),
										new CompoudValue({id: new Int16Value(8), lvl: new Int16Value(20)}),
										new CompoudValue({id: new Int16Value(10), lvl: new Int16Value(1_000)}),
										new CompoudValue({id: new Int16Value(30), lvl: new Int16Value(-5)})
									], NBTTag.Compoud)
								}),*/
								ticking: null,
							},
						},
					},
					{
						entryId: 2,
						item: {
							networkId: 5,
							count: 1,
							metadata: 0,
							blockRuntimeId: 1_722_777_465,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
					{
						entryId: 3,
						item: {
							networkId: 5,
							count: 1,
							metadata: 0,
							blockRuntimeId: 1_990_300_350,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
					{
						entryId: 4,
						item: {
							networkId: 5,
							count: 1,
							metadata: 0,
							blockRuntimeId: -1_108_868_186,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
					{
						entryId: 5,
						item: {
							networkId: 5,
							count: 1,
							metadata: 0,
							blockRuntimeId: 1_984_705_437,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
					{
						entryId: 6,
						item: {
							networkId: 5,
							count: 1,
							metadata: 0,
							blockRuntimeId: 1_501_952_743,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
					{
						entryId: 7,
						item: {
							networkId: -486,
							count: 1,
							metadata: 0,
							blockRuntimeId: 647_292_747,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
					{
						entryId: 8,
						item: {
							networkId: -537,
							count: 1,
							metadata: 0,
							blockRuntimeId: 1_754_553_875,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
					{
						entryId: 9,
						item: {
							networkId: -510,
							count: 1,
							metadata: 0,
							blockRuntimeId: -1_843_072_030,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
					{
						entryId: 10,
						item: {
							networkId: -509,
							count: 1,
							metadata: 0,
							blockRuntimeId: 832_568_857,
							extras: {
								canDestroy: [],
								canPlaceOn: [],
								hasNbt: false,
								ticking: null,
							},
						},
					},
				];

				await session.send(content);

				const biome = new BiomeDefinitionList();

				await session.send(biome);

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
					await session.sendChunk(chunk);
				}

				const status = new PlayStatus();
				status.status = PlayerStatus.PlayerSpawn;

				await session.send(status);
			}
		}
	}
}

export { ResourcePackClientResponseHandler };
