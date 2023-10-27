/* eslint-disable @typescript-eslint/member-delimiter-style */
import { Buffer } from 'node:buffer';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { inflateRawSync, deflateRawSync } from 'node:zlib';
import type {
	Encapsulated,
	RequestNetworkSettings,
	Login,
	ResourcePackClientResponse,
	RequestChunkRadius,
} from '@serenityjs/protocol';
import {
	Packets,
	Framer,
	Packet,
	Disconect,
	NetworkSettings,
	CompressionMethod,
	PlayStatus,
	PlayerStatus,
	ResourcePacksInfo,
	ResourcePackStack,
	ClientCacheStatus,
	ResourceStatus,
	StartGame,
	TickSync,
	BiomeDefinitionList,
	CreativeContent,
	LevelChunk,
	SetSpawnPosition,
	SpawnPositionType,
	Respawn,
	ChunkRadiusUpdate,
	NetworkChunkPublisherUpdate,
	DisconectReason,
} from '@serenityjs/protocol';
import type { Client } from '@serenityjs/raknet.js';
import { PacketPriority, PacketReliability } from '@serenityjs/raknet.js';
import { BinaryStream } from 'binarystream.js';
import type { Serenity } from '../Serenity';
import { itemstates } from '../itemstates.json';
import type { Logger } from '../logger';
import { EventEmitter } from '../utils';

const GameByte = Buffer.from([0xfe]);

interface PlayerEvents {
	ClientCacheStatus: [ClientCacheStatus];
	Login: [Login];
	RequestChunkRadius: [RequestChunkRadius];
	RequestNetworkSettings: [RequestNetworkSettings];
	ResourcePackClientResponse: [ResourcePackClientResponse];
	TickSync: [TickSync];
}

class Player extends EventEmitter<PlayerEvents> {
	private readonly serenity: Serenity;
	public readonly client: Client;
	private readonly logger: Logger;

	public compression = false;
	public encryption = false;

	public constructor(serenity: Serenity, client: Client) {
		super();
		this.serenity = serenity;
		this.client = client;
		this.logger = serenity.logger;
		// Bind the client events
		this.on('RequestNetworkSettings', this.handleRequestNetworkSettings.bind(this));
		this.on('Login', this.handleLogin.bind(this));
		this.on('ClientCacheStatus', this.handleClientCacheStatus.bind(this));
		this.on('ResourcePackClientResponse', this.handleResourceResponse.bind(this));
		this.on('RequestChunkRadius', this.handleRequestChunkRadius.bind(this));
		this.on('TickSync', this.handleTick.bind(this));
	}

	public send(...packets: Buffer[]): void {
		// All packets must be framed. because sometimes more than one packet is sent at a time.
		const framed = Framer.frame(...packets);
		// Check if compression is enabled, if so, compress the packet
		const compressed = this.compression ? deflateRawSync(framed) : framed;
		if (this.encryption) {
			this.logger.warn('Encryption is not supported yet.');
		} else {
			// We must concat the game byte to the front of the framed packet.
			const stream = new BinaryStream();
			stream.writeUInt8(GameByte[0]);
			stream.write(compressed);
			this.client.sendFrame(stream.getBuffer(), PacketPriority.Immediate, PacketReliability.ReliableSequenced);
		}
	}

	public sendPacket(packet: Encapsulated): void {
		this.send(packet.serialize());
	}

	public async incoming(buffer: Buffer): Promise<void> {
		// create the stream
		const stream = new BinaryStream(buffer);
		const header = stream.readUInt8();
		if (header !== GameByte[0])
			return this.logger.error(
				`Got invalid header "${header}" from "${this.client.remote.address}:${this.client.remote.port}"!`,
			);
		// Checks for encryption
		if (this.encryption) {
			this.logger.warn('Encryption is not supported yet!');
		} else {
			// Inflate the packet if compression is enabled, otherwise just read the packet
			const inflated = this.compression ? inflateRawSync(stream.readRemaining()) : stream.readRemaining();
			const frames = Framer.unframe(inflated);
			// Handle each frame individually
			for (const frame of frames) {
				const id = new BinaryStream(frame).readVarInt();
				const bin = frame;
				// Emit the buffer event
				await this.serenity.emit('buffer', { bin, id }, this);
				// Attempt to get the packet, if so, construct and emit the packet event
				const packet = Packet[id as Packets];
				if (!packet) {
					this.logger.error(
						`Unable to find packet serializer for packet "0x${id.toString(16)}" from "${this.client.remote.address}:${
							this.client.remote.port
						}"!`,
					);
					continue;
				}

				// The packet event should be emitted through the Serenity instance. But if is was cancelled, dont emit through the client.
				// try to construct the packet, and deserialize it.
				try {
					// Create the instance.
					const instance = new packet(frame).deserialize();
					// emit the packet event, if cancelled, continue.
					const value = await this.serenity.emit(Packets[instance.getId()] as any, instance, this);
					if (!value) continue;
					// Emit the packet event through the client.
					await this.emit(Packets[instance.getId()] as any, instance);
				} catch (error) {
					this.logger.error(
						`Failed to deserialize packet "0x${id.toString(16)}" from "${this.client.remote.address}:${
							this.client.remote.port
						}"!`,
					);
					this.logger.error(error);
				}
			}
		}
	}

	public disconnect(message: string, hideScreen = false, reason: DisconectReason = DisconectReason.Kicked): void {
		const packet = new Disconect();
		packet.reason = reason;
		packet.message = message;
		packet.hideDisconnectScreen = hideScreen;
		this.sendPacket(packet);
	}

	private handleTick(packet: TickSync): void {
		const tick = new TickSync();
		tick.requestTime = packet.requestTime;
		tick.responseTime = BigInt(Date.now());
		this.sendPacket(tick);
	}

	private handleRequestNetworkSettings(packet: RequestNetworkSettings): void {
		// Checks for outdated server & client protocol
		if (packet.protocol > this.serenity.protocolVerison) {
			return this.disconnect(
				`Outdated server! I'm still on version ${this.serenity.minecraftVersion} (${this.serenity.protocolVerison}).`,
			);
		} else if (packet.protocol < this.serenity.protocolVerison) {
			return this.disconnect(
				`Outdated client! Please use version ${this.serenity.minecraftVersion} (${this.serenity.protocolVerison}).`,
			);
		}

		// Create and send the NetworkSettings packet
		const settings = new NetworkSettings();
		settings.compressionThreshold = 256;
		settings.compressionMethod = CompressionMethod.Zlib;
		settings.clientThrottle = false;
		settings.clientScalar = 0;
		settings.clientThreshold = 0;
		this.sendPacket(settings);
		// Enable compression
		this.compression = true;
	}

	// TODO: decode the login tokens
	// TODO: Set up encryption
	// For now we are just going to accept the login, and skip the encryption.
	private handleLogin(packet: Login): void {
		// Send the login status
		const login = new PlayStatus();
		login.status = PlayerStatus.LoginSuccess;
		this.sendPacket(login);
	}

	// TODO: handle the client cache status?? Not sure the purpose of this packet.
	private handleClientCacheStatus(packet: ClientCacheStatus): void {
		// Send the client cache status as false
		const cache = new ClientCacheStatus();
		cache.enabled = false;
		this.sendPacket(cache);
		// Handle the resource packs info
		return this.handleResourcePacksInfo();
	}

	private handleResourcePacksInfo(): void {
		const packsInfo = new ResourcePacksInfo();
		packsInfo.forceAccept = false;
		packsInfo.hasScripts = false;
		packsInfo.mustAccept = false;
		packsInfo.resourcePacks = [];
		packsInfo.behaviorPacks = [];
		packsInfo.packLinks = [];
		this.sendPacket(packsInfo);
	}

	private handleResourceResponse(packet: ResourcePackClientResponse): void {
		switch (packet.status) {
			default:
				return this.disconnect(
					`Invalid resource pack status "${ResourceStatus[packet.status]}".`,
					false,
					DisconectReason.ResourcePackLoadingFailed,
				);
			case ResourceStatus.None:
				break;
			case ResourceStatus.Refused:
				// Check if packs are required, if so disconnect.
				break;
			case ResourceStatus.SendPacks:
				// Send the resource packs
				break;
			case ResourceStatus.HaveAllPacks: {
				// Send the resource pack stack
				// TODO: add the resource packs & behavior packs
				const packStack = new ResourcePackStack();
				packStack.mustAccept = false;
				packStack.behaviorPacks = [];
				packStack.resourcePacks = [];
				packStack.gameVersion = this.serenity.minecraftVersion;
				packStack.experiments = [];
				packStack.experimentsPreviouslyToggled = false;
				return this.sendPacket(packStack);
			}

			case ResourceStatus.Completed:
				return this.handleStartGame();
		}
	}

	private handleStartGame(): void {
		// Send the start game packet
		const start = new StartGame();
		start.entityId = 1n;
		start.runtimeEntityId = 1n;
		start.playerGamemode = 5;
		start.playerPosition = { x: 0, y: 0, z: 0 };
		start.rotation = { x: 0, y: 0 };
		start.seed = 0n;
		start.biomeType = 0;
		start.biomeName = 'plains';
		start.dimension = 0;
		start.generator = 1;
		start.worldGamemode = 0;
		start.difficulty = 1;
		start.spawnPosition = { x: 0, y: 32_767, z: 0 };
		start.achievementsDisabled = true;
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
		start.permissionLevel = 2;
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
		start.eduResourceUri = {
			buttonName: 'edu.button.learnMore',
			linkUri: 'https://aka.ms/minecraftedufaq',
		};
		start.experimentalGameplayOverride = false;
		start.chatRestrictionLevel = 0;
		start.disablePlayerInteractions = false;
		start.levelId = 'Bedrock Level';
		start.worldName = 'world';
		start.premiumWorldTemplateId = '00000000-0000-0000-0000-000000000000';
		start.isTrial = false;
		start.movementAuthority = 1;
		start.rewindHistorySize = 40;
		start.serverAuthoritativeBlockBreaking = false;
		start.currentTick = 8_243n;
		start.enchantmentSeed = 0;
		start.blockProperties = [];
		start.itemStates = itemstates;
		start.multiplayerCorrelationId = '<raknet>a555-7ece-2f1c-8f69';
		start.serverAuthoritativeInventory = true;
		start.engine = '1.20.40';
		start.propertyData = {};
		start.blockPaletteChecksum = 0n;
		start.worldTemplateId = '00000000-0000-0000-0000-000000000000';
		start.clientSideGeneration = false;
		start.blockNetworkIdsAreHashes = true;
		start.serverControlledSounds = false;
		this.sendPacket(start);

		const creative = new CreativeContent();
		creative.items = [];
		this.sendPacket(creative);

		const biomeDefinitionList = new BiomeDefinitionList();
		biomeDefinitionList.biomes = Buffer.alloc(0);
		this.sendPacket(biomeDefinitionList);

		const val = this.generateVoid();
		if (!val) this.logger.error('Failed to generate void world!');

		const spawn = new PlayStatus();
		spawn.status = PlayerStatus.PlayerSpawn;
		this.sendPacket(spawn);
	}

	private handleRequestChunkRadius(packet: RequestChunkRadius): void {
		// TODO: handle the chunk radius
	}

	private generateVoid(): boolean {
		const data = Buffer.alloc(16 * 256 * 16).fill(0);

		for (let x = 0 - 4; x <= 0 + 4; x++) {
			for (let z = 0 - 4; z <= 0 + 4; z++) {
				const chunk = new LevelChunk();
				chunk.x = x;
				chunk.z = z;
				chunk.subChunkCount = 1;
				chunk.cacheEnabled = false;
				chunk.data = data;
				this.sendPacket(chunk);
			}
		}

		return true;
	}
}

export { Player };
