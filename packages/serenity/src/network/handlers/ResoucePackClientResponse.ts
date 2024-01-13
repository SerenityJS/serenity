import { Buffer } from 'node:buffer';
import {
	ResourceStatus,
	type ResourcePackClientResponse,
	ResourcePackStack,
	StartGame,
	Gamemode,
	Difficulty,
	PermissionLevel,
	CreativeContent,
	BiomeDefinitionList,
	LevelChunk,
	PlayStatus,
	PlayerStatus,
	PlayerList,
	RecordAction,
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class ResourcePackClientResponseHandler extends NetworkHandler {
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
				start.playerPosition = { x: 0, y: 0, z: 0 };
				start.rotation = { x: 0, z: 0 };
				start.seed = 0n;
				start.biomeType = 0;
				start.biomeName = 'plains';
				start.dimension = 0;
				start.generator = 1;
				start.worldGamemode = Gamemode.Creative;
				start.difficulty = Difficulty.Normal;
				start.spawnPosition = { x: 0, y: 0, z: 0 };
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
				start.blockNetworkIdsAreHashes = false; // Important
				start.serverControlledSounds = false;

				await session.send(start);

				session.getPlayerInstance()!.abilities.setDefaults();

				const content = new CreativeContent();
				content.items = 0;

				await session.send(content);

				const biome = new BiomeDefinitionList();

				await session.send(biome);

				for (let x = 0; x < 16; x++) {
					for (let z = 0; z < 16; z++) {
						const chunk = new LevelChunk();
						chunk.x = x;
						chunk.z = z;
						chunk.subChunkCount = 0;
						chunk.cacheEnabled = false;
						chunk.data = Buffer.alloc(16 * 256 * 16).fill(0);

						await session.send(chunk);
					}
				}

				const status = new PlayStatus();
				status.status = PlayerStatus.PlayerSpawn;

				await session.send(status);
			}
		}
	}
}

export { ResourcePackClientResponseHandler };
