import { Serenity } from './Serenity';

const server = new Serenity('0.0.0.0', 19_132);

server.start();

// import { Buffer } from 'node:buffer';
// import { inflateRawSync, deflateRawSync } from 'node:zlib';
// import {
// 	Framer,
// 	Login,
// 	RequestNetworkSettings,
// 	NetworkSettings,
// 	PlayStatus,
// 	PlayerStatus,
// 	ResourcePacksInfo,
// 	ResourcePackStack,
// 	ResourcePackClientResponse,
// 	ResourceStatus,
// 	StartGame,
// 	ItemStates,
// 	CreativeContent,
// 	BiomeDefinitionList,
// 	BiomeDefinitions,
// 	LevelChunk,
// } from '@serenityjs/protocol';
// import type { Session } from '@serenityjs/raknet.js';
// import { Frame, Priority, Raknet, Reliability } from '@serenityjs/raknet.js';
// import { BinaryStream } from 'binarystream.js';

// const raknet = new Raknet(622, '1.20.40');

// raknet.motd = 'SerenityJS';

// raknet.start('0.0.0.0', 19_132);
// console.log('Started');

// const sessions: Map<Session, boolean> = new Map();

// raknet.on('Encapsulated', (session, buffer) => {
// 	const stream = new BinaryStream(buffer);
// 	const header = stream.readUInt8();
// 	if (header !== 0xfe) return console.log('Invalid header');
// 	const compression = sessions.has(session) ? sessions.get(session) : sessions.set(session, false).get(session);
// 	const inflated = compression ? inflateRawSync(stream.readRemaining()) : stream.readRemaining();
// 	const frames = Framer.unframe(inflated);
// 	for (const frame of frames) {
// 		const stream = new BinaryStream(frame);
// 		const id = stream.readVarInt();
// 		switch (id) {
// 			default: {
// 				console.log('Unknown packet', id.toString(16));
// 				break;
// 			}

// 			case RequestNetworkSettings.id: {
// 				const requestNetworkSettings = new RequestNetworkSettings(frame).deserialize();
// 				console.log(requestNetworkSettings.protocol);
// 				const networkSettings = new NetworkSettings();
// 				networkSettings.compressionThreshold = 256;
// 				networkSettings.compressionMethod = 0;
// 				networkSettings.clientThrottle = false;
// 				networkSettings.clientThreshold = 0;
// 				networkSettings.clientScalar = 0;
// 				send(networkSettings.serialize(), session);
// 				sessions.set(session, true);
// 				break;
// 			}

// 			case Login.id: {
// 				const login = new Login(frame).deserialize();
// 				const longinStatus = new PlayStatus();
// 				longinStatus.status = PlayerStatus.LoginSuccess;
// 				send(longinStatus.serialize(), session);

// 				const resInfo = new ResourcePacksInfo();
// 				resInfo.forceAccept = false;
// 				resInfo.hasScripts = false;
// 				resInfo.mustAccept = false;
// 				resInfo.resourcePacks = [];
// 				resInfo.behaviorPacks = [];
// 				resInfo.packLinks = [];
// 				send(resInfo.serialize(), session);

// 				const resStack = new ResourcePackStack();
// 				resStack.mustAccept = false;
// 				resStack.gameVersion = '1.20.40';
// 				resStack.experiments = [];
// 				resStack.resourcePacks = [];
// 				resStack.behaviorPacks = [];
// 				send(resStack.serialize(), session);

// 				const start = new StartGame();
// 				start.entityId = 1n;
// 				start.runtimeEntityId = 1n;
// 				start.playerGamemode = 5;
// 				start.playerPosition = { x: 0, y: 0, z: 0 };
// 				start.rotation = { x: 0, y: 0 };
// 				start.seed = 0n;
// 				start.biomeType = 0;
// 				start.biomeName = 'plains';
// 				start.dimension = 0;
// 				start.generator = 1;
// 				start.worldGamemode = 0;
// 				start.difficulty = 1;
// 				start.spawnPosition = { x: 0, y: 32_767, z: 0 };
// 				start.achievementsDisabled = true;
// 				start.editorWorldType = 0;
// 				start.createdInEdior = false;
// 				start.exportedFromEdior = false;
// 				start.dayCycleStopTime = 8_250;
// 				start.eduOffer = 0;
// 				start.eduFeatures = false;
// 				start.eduProductUuid = '';
// 				start.rainLevel = 0;
// 				start.lightningLevel = 0;
// 				start.confirmedPlatformLockedContent = false;
// 				start.multiplayerGame = true;
// 				start.broadcastToLan = true;
// 				start.xblBroadcastMode = 6;
// 				start.platformBroadcastMode = 6;
// 				start.commandsEnabled = true;
// 				start.texturePacksRequired = false;
// 				start.gamerules = [
// 					{
// 						name: 'commandblockoutput',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'dodaylightcycle',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'doentitydrops',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'dofiretick',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'recipesunlock',
// 						editable: true,
// 						type: 1,
// 						value: false,
// 					},
// 					{
// 						name: 'dolimitedcrafting',
// 						editable: true,
// 						type: 1,
// 						value: false,
// 					},
// 					{
// 						name: 'domobloot',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'domobspawning',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'dotiledrops',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'doweathercycle',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'drowningdamage',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'falldamage',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'firedamage',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'keepinventory',
// 						editable: true,
// 						type: 1,
// 						value: false,
// 					},
// 					{
// 						name: 'mobgriefing',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'pvp',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'showcoordinates',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'naturalregeneration',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'tntexplodes',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'sendcommandfeedback',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'maxcommandchainlength',
// 						editable: true,
// 						type: 2,
// 						value: 65_535,
// 					},
// 					{
// 						name: 'doinsomnia',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'commandblocksenabled',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'randomtickspeed',
// 						editable: true,
// 						type: 2,
// 						value: 1,
// 					},
// 					{
// 						name: 'doimmediaterespawn',
// 						editable: true,
// 						type: 1,
// 						value: false,
// 					},
// 					{
// 						name: 'showdeathmessages',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'functioncommandlimit',
// 						editable: true,
// 						type: 2,
// 						value: 10_000,
// 					},
// 					{
// 						name: 'spawnradius',
// 						editable: true,
// 						type: 2,
// 						value: 10,
// 					},
// 					{
// 						name: 'showtags',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'freezedamage',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'respawnblocksexplode',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'showbordereffect',
// 						editable: true,
// 						type: 1,
// 						value: true,
// 					},
// 					{
// 						name: 'playerssleepingpercentage',
// 						editable: true,
// 						type: 2,
// 						value: 100,
// 					},
// 				];
// 				start.experiments = [];
// 				start.experimentsPreviouslyToggled = false;
// 				start.bonusChest = false;
// 				start.mapEnabled = false;
// 				start.permissionLevel = 2;
// 				start.serverChunkTickRange = 4;
// 				start.hasLockedBehaviorPack = false;
// 				start.hasLockedResourcePack = false;
// 				start.isFromLockedWorldTemplate = false;
// 				start.useMsaGamertagsOnly = false;
// 				start.isFromWorldTemplate = false;
// 				start.isWorldTemplateOptionLocked = false;
// 				start.onlySpawnV1Villagers = false;
// 				start.personaDisabled = false;
// 				start.customSkinsDisabled = false;
// 				start.emoteChatMuted = false;
// 				start.gameVersion = '*';
// 				start.limitedWorldWidth = 16;
// 				start.limitedWorldLength = 16;
// 				start.isNewNether = false;
// 				start.eduResourceUri = {
// 					buttonName: 'edu.button.learnMore',
// 					linkUri: 'https://aka.ms/minecraftedufaq',
// 				};
// 				start.experimentalGameplayOverride = false;
// 				start.chatRestrictionLevel = 0;
// 				start.disablePlayerInteractions = false;
// 				start.levelId = 'Bedrock Level';
// 				start.worldName = 'world';
// 				start.premiumWorldTemplateId = '00000000-0000-0000-0000-000000000000';
// 				start.isTrial = false;
// 				start.movementAuthority = 1;
// 				start.rewindHistorySize = 40;
// 				start.serverAuthoritativeBlockBreaking = false;
// 				start.currentTick = 8_243n;
// 				start.enchantmentSeed = 0;
// 				start.blockProperties = [];
// 				start.itemStates = ItemStates;
// 				start.multiplayerCorrelationId = '<raknet>a555-7ece-2f1c-8f69';
// 				start.serverAuthoritativeInventory = true;
// 				start.engine = '1.20.40';
// 				start.propertyData = {};
// 				start.blockPaletteChecksum = 0n;
// 				start.worldTemplateId = '00000000-0000-0000-0000-000000000000';
// 				start.clientSideGeneration = false;
// 				start.blockNetworkIdsAreHashes = false;
// 				start.serverControlledSounds = false;
// 				send(start.serialize(), session);

// 				const creative = new CreativeContent();
// 				creative.items = [];
// 				send(creative.serialize(), session);

// 				const biomes = new BiomeDefinitionList();
// 				biomes.biomes = BiomeDefinitions;
// 				send(biomes.serialize(), session);

// 				const data = Buffer.alloc(16 * 16 * 256).fill(0);

// 				const chunk = new LevelChunk();
// 				chunk.x = 0;
// 				chunk.z = 0;
// 				chunk.subChunkCount = 1;
// 				chunk.cacheEnabled = false;
// 				chunk.data = data;
// 				send(chunk.serialize(), session);

// 				const spawn = new PlayStatus();
// 				spawn.status = PlayerStatus.PlayerSpawn;
// 				send(spawn.serialize(), session);
// 				break;
// 			}

// 			case 0x81: {
// 				const resInfo = new ResourcePacksInfo();
// 				resInfo.forceAccept = false;
// 				resInfo.hasScripts = false;
// 				resInfo.mustAccept = false;
// 				resInfo.resourcePacks = [];
// 				resInfo.behaviorPacks = [];
// 				resInfo.packLinks = [];
// 				send(resInfo.serialize(), session);

// 				const resStack = new ResourcePackStack();
// 				resStack.mustAccept = false;
// 				resStack.gameVersion = '1.20.40';
// 				resStack.experiments = [];
// 				resStack.resourcePacks = [];
// 				resStack.behaviorPacks = [];
// 				send(resStack.serialize(), session);
// 				break;
// 			}

// 			case 0x08: {
// 				break;
// 			}
// 		}
// 	}
// });

// function send(buffer: Buffer, session: Session, priority = Priority.Normal): void {
// 	const framed = Framer.frame(buffer);
// 	const compression = sessions.has(session) ? sessions.get(session) : sessions.set(session, false).get(session);
// 	const deflated = compression ? deflateRawSync(framed) : framed;
// 	const stream = new BinaryStream();
// 	stream.writeUInt8(0xfe);
// 	stream.write(deflated);

// 	const frame = new Frame();
// 	frame.reliability = Reliability.ReliableOrdered;
// 	frame.orderChannel = 0;
// 	frame.body = stream.getBuffer();

// 	session.sendFrame(frame, priority);
// }
