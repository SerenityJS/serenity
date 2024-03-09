import { BIOME_DEFINITION_LIST } from '@serenityjs/bedrock-data';
import {
	BiomeDefinitionList,
	CreativeContent,
	Difficulty,
	Gamemode,
	PermissionLevel,
	PlayerList,
	StartGame,
	type DataPacket,
} from '@serenityjs/bedrock-protocol';
import type { Player } from '../player/Player.js';
import type { World } from './World.js';
import { BlockPermutation } from './chunk/index.js';
import { ItemType } from './items/Type.js';

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
	public broadcast(...packets: DataPacket[]): void {
		// Loop through each player.
		for (const player of this.world.getPlayers().values()) {
			// Send the packet to that player.
			player.session.send(...packets);
		}
	}

	/**
	 * Broadcast a packet to all players in the world immediately.
	 *
	 * @param packets - The packets to broadcast.
	 */
	public broadcastImmediate(...packets: DataPacket[]): void {
		// Loop through each player.
		for (const player of this.world.getPlayers().values()) {
			// Send the packet to that player.
			player.session.sendImmediate(...packets);
		}
	}

	/**
	 * Send the start game packet to the player.
	 *
	 * @param player - The player to send the start game packet to.
	 */
	public sendStartGame(player: Player): void {
		// Create a new start game packet.
		const packet = new StartGame();

		// Assign the start game packet.
		packet.entityId = player.uniqueId;
		packet.runtimeEntityId = player.runtimeId;
		packet.playerGamemode = player.gamemode;
		packet.playerPosition = player.dimension.spawn;
		packet.pitch = player.rotation.pitch;
		packet.yaw = player.rotation.yaw;
		packet.seed = BigInt(this.world.properties.seed);
		packet.biomeType = 0;
		packet.biomeName = 'plains';
		packet.dimension = player.dimension.type;
		packet.generator = 1;
		packet.worldGamemode = Gamemode.Creative;
		packet.difficulty = Difficulty.Easy;
		packet.spawnPosition = player.dimension.spawn;
		packet.achievementsDisabled = true;
		packet.editorWorldType = 0;
		packet.createdInEdior = false;
		packet.exportedFromEdior = false;
		packet.dayCycleStopTime = 0;
		packet.eduOffer = 0;
		packet.eduFeatures = false;
		packet.eduProductUuid = '';
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
		packet.gameVersion = '*';
		packet.limitedWorldWidth = 16;
		packet.limitedWorldLength = 16;
		packet.isNewNether = false;
		packet.eduResourceUriButtonName = '';
		packet.eduResourceUriLink = '';
		packet.experimentalGameplayOverride = false;
		packet.chatRestrictionLevel = 0;
		packet.disablePlayerInteractions = false;
		packet.levelId = 'SerenityJS';
		packet.worldName = this.world.properties.name;
		packet.premiumWorldTemplateId = '00000000-0000-0000-0000-000000000000';
		packet.isTrial = false;
		packet.movementAuthority = 0;
		packet.rewindHistorySize = 0;
		packet.serverAuthoritativeBlockBreaking = true;
		packet.currentTick = 0n;
		packet.enchantmentSeed = 0;
		packet.blockProperties = [];
		packet.itemstates = this.world.items.getTypes().map((item) => {
			return {
				name: item.identifier,
				runtimeId: item.networkId,
				componentBased: false,
			};
		});
		packet.multiplayerCorrelationId = '<raknet>a555-7ece-2f1c-8f69';
		packet.serverAuthoritativeInventory = true;
		packet.engine = '*';
		packet.propertyData1 = 0x0a;
		packet.propertyData2 = 0x00;
		packet.propertyData3 = 0x00;
		packet.blockPaletteChecksum = 0n;
		packet.worldTemplateId = '00000000000000000000000000000000';
		packet.clientSideGeneration = true;
		packet.blockNetworkIdsAreHashes = false; // Important
		packet.serverControlledSounds = false;

		// Send the start game packet to the player.
		player.session.send(packet);
	}

	/**
	 * Send the creative content packet to the player.
	 *
	 * @param player - The player to send the creative content packet to.
	 */
	public sendCreativeContent(player: Player): void {
		// Create a new CreativeContent packet.
		const packet = new CreativeContent();

		// Assign the creative content packet.
		packet.items = ItemType.types.map((item) => {
			return {
				entryId: item.runtimeId,
				item: {
					blockRuntimeId: item.permutation?.getRuntimeId() ?? 0,
					count: 1,
					metadata: item.metadata,
					networkId: item.networkId,
					extras: {
						canDestroy: [],
						canPlaceOn: [],
						hasNbt: false,
						nbt: {},
					},
				},
			};
		});
		// 		entryId: 1,
		// 		item: {
		// 			networkId: 5,
		// 			count: 1,
		// 			metadata: 0,
		// 			blockRuntimeId: 0,
		// 			extras: {
		// 				canDestroy: [],
		// 				canPlaceOn: [],
		// 				hasNbt: false,
		// 				nbt: {},
		// 				ticking: null,
		// 			},
		// 		},
		// 	},
		// 	{
		// 		entryId: 2,
		// 		item: {
		// 			networkId: 5,
		// 			count: 1,
		// 			metadata: 0,
		// 			blockRuntimeId: BlockPermutation.resolve('minecraft:spruce_planks').getRuntimeId(),
		// 			extras: {
		// 				canDestroy: [],
		// 				canPlaceOn: [],
		// 				hasNbt: false,
		// 				nbt: {},
		// 				ticking: null,
		// 			},
		// 		},
		// 	},
		// 	{
		// 		entryId: 3,
		// 		item: {
		// 			networkId: 5,
		// 			count: 1,
		// 			metadata: 0,
		// 			blockRuntimeId: BlockPermutation.resolve('minecraft:spruce_planks').getRuntimeId(),
		// 			extras: {
		// 				canDestroy: [],
		// 				canPlaceOn: [],
		// 				hasNbt: false,
		// 				nbt: {},
		// 				ticking: null,
		// 			},
		// 		},
		// 	},
		// 	{
		// 		entryId: 4,
		// 		item: {
		// 			networkId: 5,
		// 			count: 1,
		// 			metadata: 0,
		// 			blockRuntimeId: BlockPermutation.resolve('minecraft:spruce_planks').getRuntimeId(),
		// 			extras: {
		// 				canDestroy: [],
		// 				canPlaceOn: [],
		// 				hasNbt: false,
		// 				nbt: {},
		// 				ticking: null,
		// 			},
		// 		},
		// 	},
		// 	{
		// 		entryId: 5,
		// 		item: {
		// 			networkId: 5,
		// 			count: 1,
		// 			metadata: 0,
		// 			blockRuntimeId: BlockPermutation.resolve('minecraft:spruce_planks').getRuntimeId(),
		// 			extras: {
		// 				canDestroy: [],
		// 				canPlaceOn: [],
		// 				hasNbt: false,
		// 				nbt: {},
		// 				ticking: null,
		// 			},
		// 		},
		// 	},
		// 	{
		// 		entryId: 6,
		// 		item: {
		// 			networkId: 5,
		// 			count: 1,
		// 			metadata: 0,
		// 			blockRuntimeId: BlockPermutation.resolve('minecraft:spruce_planks').getRuntimeId(),
		// 			extras: {
		// 				canDestroy: [],
		// 				canPlaceOn: [],
		// 				hasNbt: false,
		// 				nbt: {},
		// 				ticking: null,
		// 			},
		// 		},
		// 	},
		// ];

		// Send the creative content packet to the player.
		player.session.send(packet);
	}

	/**
	 * Send the biome definition list packet to the player.
	 *
	 * @param player - The player to send the biome definition list packet to.
	 */
	public sendBiomeDefinitionList(player: Player): void {
		// Create a new BiomeDefinitionList packet.
		const packet = new BiomeDefinitionList();

		// Assign the biome definition list packet.
		packet.biomes = BIOME_DEFINITION_LIST;

		// Send the biome definition list packet to the player.
		player.session.send(packet);
	}
}

export { WorldNetwork };
