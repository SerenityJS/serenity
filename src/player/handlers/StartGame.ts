import { Buffer } from 'node:buffer';
import { setTimeout } from 'node:timers';
import {
	Itemstates,
	CreativeContent,
	BiomeDefinitionList,
	BiomeDefinitions,
	LevelChunk,
	PlayStatus,
	PlayerStatus,
	Disconect,
	DisconectReason,
} from '@serenityjs/protocol';
import type { StartGame } from '@serenityjs/protocol';
import type { NetworkSession } from '../NetworkSession';
import { Handler } from './Handler';

class StartGameHandler extends Handler {
	public static override handle(packet: StartGame, session: NetworkSession): void {
		// At this point, the player should be logged in, and a Player instance should be available
		// So we need to get that player instance from our NetworkSession
		// So lets get the player. And we will check if the player is available
		const player = this.serenity.getPlayerFromNetworkSession(session);
		if (!player) {
			this.logger.error(`Failed to get player instance from session! (${session.session.guid})`);
			return session.disconnect('Failed to get player instance from session!', false, DisconectReason.MissingClient);
		}

		// New we need to send a StartGame packet to the player
		// Will put us in the next stage of the Spawn process
		packet.entityId = session.runtimeId; // TODO: Change to player entity id
		packet.runtimeEntityId = session.runtimeId;
		packet.playerGamemode = 5;
		packet.playerPosition = { x: 0, y: 30, z: 0 };
		packet.rotation = { x: 0, z: 0 };
		packet.seed = 0n;
		packet.biomeType = 0;
		packet.biomeName = 'plains';
		packet.dimension = 0;
		packet.generator = 1;
		packet.worldGamemode = 0;
		packet.difficulty = 1;
		packet.spawnPosition = { x: 0, y: 30, z: 0 };
		packet.achievementsDisabled = true;
		packet.editorWorldType = 0;
		packet.createdInEdior = false;
		packet.exportedFromEdior = false;
		packet.dayCycleStopTime = 8_250;
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
		packet.permissionLevel = 2;
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
		packet.eduResourceUri = {
			buttonName: 'edu.button.learnMore',
			linkUri: 'https://aka.ms/minecraftedufaq',
		};
		packet.experimentalGameplayOverride = false;
		packet.chatRestrictionLevel = 0;
		packet.disablePlayerInteractions = false;
		packet.levelId = player.world.name;
		packet.worldName = player.world.name;
		packet.premiumWorldTemplateId = '00000000-0000-0000-0000-000000000000';
		packet.isTrial = false;
		packet.movementAuthority = 0;
		packet.rewindHistorySize = 40;
		packet.serverAuthoritativeBlockBreaking = false;
		packet.currentTick = 0n;
		packet.enchantmentSeed = 0;
		packet.blockProperties = [];
		packet.itemStates = Itemstates;
		packet.multiplayerCorrelationId = '<raknet>a555-7ece-2f1c-8f69';
		packet.serverAuthoritativeInventory = true;
		packet.engine = this.serenity.minecraftVersion;
		packet.propertyData = {};
		packet.blockPaletteChecksum = 0n;
		packet.worldTemplateId = '00000000-0000-0000-0000-000000000000';
		packet.clientSideGeneration = false;
		packet.blockNetworkIdsAreHashes = false;
		packet.serverControlledSounds = false;
		// Now lets send the packet to the player
		player.sendPacket(packet);

		// TODO: change and handle else where
		// Send the creative content packet to the player
		const creative = new CreativeContent();
		creative.items = [];
		session.send(creative.serialize());

		// Send the biome definition list packet to the player
		const biome = new BiomeDefinitionList();
		biome.biomes = BiomeDefinitions;
		session.send(biome.serialize());

		// Send the level chunk packet to the player
		player.world.sendChunk(player);

		// Send the play status packet to the player
		// TODO: Change this to a handler, and not use a settimeout
		setTimeout(() => {
			const spawn = new PlayStatus();
			spawn.status = PlayerStatus.PlayerSpawn;
			session.send(spawn.serialize());
		}, 4_000);
	}
}

export { StartGameHandler };
