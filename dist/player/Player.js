"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
/* eslint-disable @typescript-eslint/member-delimiter-style */
const node_buffer_1 = require("node:buffer");
const node_zlib_1 = require("node:zlib");
const protocol_1 = require("@serenityjs/protocol");
const raknet_js_1 = require("@serenityjs/raknet.js");
const binarystream_js_1 = require("binarystream.js");
const itemstates_json_1 = require("../itemstates.json");
const utils_1 = require("../utils");
const GameByte = node_buffer_1.Buffer.from([0xfe]);
class Player extends utils_1.EventEmitter {
    constructor(serenity, client) {
        super();
        this.compression = false;
        this.encryption = false;
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
    send(...packets) {
        // All packets must be framed. because sometimes more than one packet is sent at a time.
        const framed = protocol_1.Framer.frame(...packets);
        // Check if compression is enabled, if so, compress the packet
        const compressed = this.compression ? (0, node_zlib_1.deflateRawSync)(framed) : framed;
        if (this.encryption) {
            this.logger.warn('Encryption is not supported yet.');
        }
        else {
            // We must concat the game byte to the front of the framed packet.
            const stream = new binarystream_js_1.BinaryStream();
            stream.writeUInt8(GameByte[0]);
            stream.write(compressed);
            this.client.sendFrame(stream.getBuffer(), raknet_js_1.PacketPriority.Immediate, raknet_js_1.PacketReliability.ReliableSequenced);
        }
    }
    sendPacket(packet) {
        this.send(packet.serialize());
    }
    async incoming(buffer) {
        // create the stream
        const stream = new binarystream_js_1.BinaryStream(buffer);
        const header = stream.readUInt8();
        if (header !== GameByte[0])
            return this.logger.error(`Got invalid header "${header}" from "${this.client.remote.address}:${this.client.remote.port}"!`);
        // Checks for encryption
        if (this.encryption) {
            this.logger.warn('Encryption is not supported yet!');
        }
        else {
            // Inflate the packet if compression is enabled, otherwise just read the packet
            const inflated = this.compression ? (0, node_zlib_1.inflateRawSync)(stream.readRemaining()) : stream.readRemaining();
            const frames = protocol_1.Framer.unframe(inflated);
            // Handle each frame individually
            for (const frame of frames) {
                const id = new binarystream_js_1.BinaryStream(frame).readVarInt();
                const bin = frame;
                // Emit the buffer event
                await this.serenity.emit('buffer', { bin, id }, this);
                // Attempt to get the packet, if so, construct and emit the packet event
                const packet = protocol_1.Packet[id];
                if (!packet) {
                    this.logger.error(`Unable to find packet serializer for packet "0x${id.toString(16)}" from "${this.client.remote.address}:${this.client.remote.port}"!`);
                    continue;
                }
                // The packet event should be emitted through the Serenity instance. But if is was cancelled, dont emit through the client.
                // try to construct the packet, and deserialize it.
                try {
                    // Create the instance.
                    const instance = new packet(frame).deserialize();
                    // emit the packet event, if cancelled, continue.
                    const value = await this.serenity.emit(protocol_1.Packets[instance.getId()], instance, this);
                    if (!value)
                        continue;
                    // Emit the packet event through the client.
                    await this.emit(protocol_1.Packets[instance.getId()], instance);
                }
                catch (error) {
                    this.logger.error(`Failed to deserialize packet "0x${id.toString(16)}" from "${this.client.remote.address}:${this.client.remote.port}"!`);
                    this.logger.error(error);
                }
            }
        }
    }
    disconnect(message, hideScreen = false, reason = protocol_1.DisconectReason.Kicked) {
        const packet = new protocol_1.Disconect();
        packet.reason = reason;
        packet.message = message;
        packet.hideDisconnectScreen = hideScreen;
        this.sendPacket(packet);
    }
    handleTick(packet) {
        const tick = new protocol_1.TickSync();
        tick.requestTime = packet.requestTime;
        tick.responseTime = BigInt(Date.now());
        this.sendPacket(tick);
    }
    handleRequestNetworkSettings(packet) {
        // Checks for outdated server & client protocol
        if (packet.protocol > this.serenity.protocolVerison) {
            return this.disconnect(`Outdated server! I'm still on version ${this.serenity.minecraftVersion} (${this.serenity.protocolVerison}).`);
        }
        else if (packet.protocol < this.serenity.protocolVerison) {
            return this.disconnect(`Outdated client! Please use version ${this.serenity.minecraftVersion} (${this.serenity.protocolVerison}).`);
        }
        // Create and send the NetworkSettings packet
        const settings = new protocol_1.NetworkSettings();
        settings.compressionThreshold = 256;
        settings.compressionMethod = protocol_1.CompressionMethod.Zlib;
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
    handleLogin(packet) {
        // Send the login status
        const login = new protocol_1.PlayStatus();
        login.status = protocol_1.PlayerStatus.LoginSuccess;
        this.sendPacket(login);
    }
    // TODO: handle the client cache status?? Not sure the purpose of this packet.
    handleClientCacheStatus(packet) {
        // Send the client cache status as false
        const cache = new protocol_1.ClientCacheStatus();
        cache.enabled = false;
        this.sendPacket(cache);
        // Handle the resource packs info
        return this.handleResourcePacksInfo();
    }
    handleResourcePacksInfo() {
        const packsInfo = new protocol_1.ResourcePacksInfo();
        packsInfo.forceAccept = false;
        packsInfo.hasScripts = false;
        packsInfo.mustAccept = false;
        packsInfo.resourcePacks = [];
        packsInfo.behaviorPacks = [];
        packsInfo.packLinks = [];
        this.sendPacket(packsInfo);
    }
    handleResourceResponse(packet) {
        switch (packet.status) {
            default:
                return this.disconnect(`Invalid resource pack status "${protocol_1.ResourceStatus[packet.status]}".`, false, protocol_1.DisconectReason.ResourcePackLoadingFailed);
            case protocol_1.ResourceStatus.None:
                break;
            case protocol_1.ResourceStatus.Refused:
                // Check if packs are required, if so disconnect.
                break;
            case protocol_1.ResourceStatus.SendPacks:
                // Send the resource packs
                break;
            case protocol_1.ResourceStatus.HaveAllPacks: {
                // Send the resource pack stack
                // TODO: add the resource packs & behavior packs
                const packStack = new protocol_1.ResourcePackStack();
                packStack.mustAccept = false;
                packStack.behaviorPacks = [];
                packStack.resourcePacks = [];
                packStack.gameVersion = this.serenity.minecraftVersion;
                packStack.experiments = [];
                packStack.experimentsPreviouslyToggled = false;
                return this.sendPacket(packStack);
            }
            case protocol_1.ResourceStatus.Completed:
                return this.handleStartGame();
        }
    }
    handleStartGame() {
        // Send the start game packet
        const start = new protocol_1.StartGame();
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
        start.spawnPosition = { x: 0, y: 32767, z: 0 };
        start.achievementsDisabled = true;
        start.editorWorldType = 0;
        start.createdInEdior = false;
        start.exportedFromEdior = false;
        start.dayCycleStopTime = 8250;
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
                value: 65535,
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
                value: 10000,
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
        start.currentTick = 8243n;
        start.enchantmentSeed = 0;
        start.blockProperties = [];
        start.itemStates = itemstates_json_1.itemstates;
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
        const creative = new protocol_1.CreativeContent();
        creative.items = [];
        this.sendPacket(creative);
        const biomeDefinitionList = new protocol_1.BiomeDefinitionList();
        biomeDefinitionList.biomes = node_buffer_1.Buffer.alloc(0);
        this.sendPacket(biomeDefinitionList);
        const val = this.generateVoid();
        if (!val)
            this.logger.error('Failed to generate void world!');
        const spawn = new protocol_1.PlayStatus();
        spawn.status = protocol_1.PlayerStatus.PlayerSpawn;
        this.sendPacket(spawn);
    }
    handleRequestChunkRadius(packet) {
        // TODO: handle the chunk radius
    }
    generateVoid() {
        const data = node_buffer_1.Buffer.alloc(16 * 256 * 16).fill(0);
        for (let x = 0 - 4; x <= 0 + 4; x++) {
            for (let z = 0 - 4; z <= 0 + 4; z++) {
                const chunk = new protocol_1.LevelChunk();
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
exports.Player = Player;
