import { BIOME_DEFINITION_LIST } from '@serenityjs/bedrock-data';
import {
	Disconnect,
	MovePlayer,
	StartGame,
	Gamemode,
	Difficulty,
	PermissionLevel,
	CreativeContent,
	BiomeDefinitionList,
	ModalFormRequest,
} from '@serenityjs/bedrock-protocol';
import type { DataPacket, DisconnectReason } from '@serenityjs/bedrock-protocol';
import type { Connection, NetworkIdentifier } from '@serenityjs/raknet-server';
import type { Serenity } from '../Serenity';
import type { Player } from '../player';
import type { Network } from './Network';

let RUNTIME_ID = 1n;

// NOTE
// STRUCTURE FOR PLAYER AND NEWORKSESSION CLASS
// Any methods that will directly interact with the player should be in the player class.
// Any methods that will NOT directly interact with the player should be in the network session class.
// The methods in the network session class should be used for reiceving packets from other players.
// For example, the player class has a sendMessage() method, this method will directly interact with the player, by sending a message on screen.
// Another example, the network session class has a receiveMovement() method, this method will NOT directly interact with the player,
// As this method handles the movement of other players, not the player itself.
//

class NetworkSession {
	public readonly serenity: Serenity;
	public readonly network: Network;
	public readonly connection: Connection;
	public readonly guid: bigint;
	public readonly identifier: NetworkIdentifier;
	public readonly runtimeId: bigint;
	public readonly uniqueId: bigint;

	public encryption: boolean = false;
	public compression: boolean = false;

	protected player: Player | null = null;
	protected formId: number = 0;

	/**
	 * Creates a new network session.
	 *
	 * @param serenity The serenity instance.
	 * @param connection The connection.
	 * @returns A new network session.
	 */
	public constructor(serenity: Serenity, connection: Connection) {
		this.serenity = serenity;
		this.network = serenity.network;
		this.connection = connection;
		this.guid = connection.guid;
		this.identifier = connection.identifier;
		this.runtimeId = RUNTIME_ID++;
		this.uniqueId = BigInt.asUintN(64, this.guid ^ this.runtimeId);
	}

	/**
	 * Sends a packet to the client.
	 *
	 * @param packets The packets to send.
	 * @returns A promise that resolves when the packet has been sent.
	 */
	public async send(...packets: DataPacket[]): Promise<void> {
		return this.network.send(this, ...packets);
	}

	public disconnect(message: string, reason: DisconnectReason, hideReason = false): void {
		const packet = new Disconnect();
		packet.message = message;
		packet.reason = reason;
		packet.hideDisconnectionScreen = hideReason;

		void this.send(packet);
	}

	/**
	 * Gets the player instance for this session.
	 *
	 * @returns The player instance.
	 */
	public getPlayerInstance(): Player | null {
		// Check if the player is already set.
		if (this.player) return this.player;

		// Sort the players map into an array.
		// Then we will attempt to find the player with the same session as this.
		const players = [...this.serenity.players.values()];
		const player = players.find((x) => x.session === this);

		// If the player is not found, return null.
		if (!player) return null;

		// Set the player to this session.
		this.player = player;

		// Return the player.
		return player;
	}

	/**
	 * Sends the start game packet to the client.
	 *
	 * @returns
	 */
	public async sendStartGame(): Promise<void> {
		// Check if our player instance is null.
		// If it is, we will log an error and return.
		if (!this.player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${this.identifier.address}:${this.identifier.port}! NetworkSession.sendStartGame()`,
			);
		}

		// TODO: Assign the proper fields in the future.
		// Create a new start game packet.
		const packet = new StartGame();

		// Assign the start game packet.
		packet.entityId = this.player.uniqueEntityId;
		packet.runtimeEntityId = this.player.runtimeEntityId;
		packet.playerGamemode = Gamemode.Creative;
		packet.playerPosition = { x: 0, y: -54, z: 0 };
		packet.rotation = { x: 0, z: 0 };
		packet.seed = BigInt(this.player.getWorld().seed);
		packet.biomeType = 0;
		packet.biomeName = 'plains';
		packet.dimension = this.player.getDimension().type;
		packet.generator = 1;
		packet.worldGamemode = Gamemode.Creative;
		packet.difficulty = Difficulty.Normal;
		packet.spawnPosition = { x: 0, y: -54, z: 0 };
		packet.achievementsDisabled = false;
		packet.editorWorldType = 0;
		packet.createdInEdior = false;
		packet.exportedFromEdior = false;
		packet.dayCycleStopTime = 8_250;
		packet.eduOffer = 1;
		packet.eduFeatures = true;
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
		packet.serverChunkTickRange = 4;
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
		packet.worldName = this.player.getWorld().name;
		packet.premiumWorldTemplateId = '00000000-0000-0000-0000-000000000000';
		packet.isTrial = false;
		packet.movementAuthority = 0;
		packet.rewindHistorySize = 40;
		packet.serverAuthoritativeBlockBreaking = false;
		packet.currentTick = 0n;
		packet.enchantmentSeed = 0;
		packet.blockProperties = [];
		packet.itemStates = [];
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

		// Await the packet to be sent.
		return this.send(packet);
	}

	/**
	 * Sends the creative content packet to the client.
	 *
	 * @returns
	 */
	public async sendCreativeContent(): Promise<void> {
		// Check if our player instance is null.
		// If it is, we will log an error and return.
		if (!this.player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${this.identifier.address}:${this.identifier.port}! NetworkSession.sendCreativeContent()`,
			);
		}

		// Create a new creative content packet.
		const packet = new CreativeContent();

		// TODO: Map out the items registered to the world.
		// Assign the creative content packet.
		packet.items = [];

		// Send the creative content packet.
		return this.send(packet);
	}

	/**
	 * Sends the biome definition list packet to the client.
	 *
	 * @returns
	 */
	public async sendBiomeDefinitionList(): Promise<void> {
		// Check if our player instance is null.
		// If it is, we will log an error and return.
		if (!this.player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${this.identifier.address}:${this.identifier.port}! NetworkSession.sendBiomeDefinitionList()`,
			);
		}

		// TODO: Map out the biomes registered to the world.
		// Create a new biome definition list packet.
		const packet = new BiomeDefinitionList();

		// Assign the biome definition list packet.
		packet.biomes = BIOME_DEFINITION_LIST;

		// Send the biome definition list packet.
		return this.send(packet);
	}

	/**
	 * Sends a modal form request to the client.
	 *
	 * @param payload The payload to send.
	 * @returns The form id.
	 */
	public async sendModalFormRequest(payload: string): Promise<number> {
		// Create a new modal form request packet.
		const packet = new ModalFormRequest();

		// Get the next form id.
		const formId = this.formId++;

		// Assign the modal form request packet.
		packet.formId = formId;
		packet.payload = payload;

		// Send the modal form request packet.
		await this.send(packet);

		// Return the form id.
		return formId;
	}
}

export { NetworkSession };
