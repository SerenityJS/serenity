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
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class StartGameHandler extends PlayerHandler {
	public static override handle(packet: StartGame, player: Player): void {
		// New we need to send a StartGame packet to the player
		// Will put us in the next stage of the Spawn process
		packet.entityId = player.runtimeId; // TODO: Change to player entity id
		packet.runtimeEntityId = player.runtimeId;
		packet.playerGamemode = player.world.settings.getGamemode();
		packet.playerPosition = { x: 0, y: 0, z: 0 };
		packet.rotation = { x: 0, z: 0 };
		packet.seed = player.world.settings.seed;
		packet.biomeType = 0;
		packet.biomeName = 'plains';
		packet.dimension = 0;
		packet.generator = 1;
		packet.worldGamemode = 0;
		packet.difficulty = 1;
		packet.spawnPosition = { x: 0, y: 0, z: 0 };
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
		packet.permissionLevel = player.world.settings.getPermissionLevel();
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
		packet.levelId = player.world.settings.getWorldName();
		packet.worldName = player.world.settings.getWorldName();
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
		packet.clientSideGeneration = true;
		packet.blockNetworkIdsAreHashes = true;
		packet.serverControlledSounds = false;
		// Now lets send the packet to the player
		player.sendPacket(packet);

		// TODO: change and handle else where
		// Send the creative content packet to the player
		const creative = new CreativeContent();
		creative.items = [];
		player.sendPacket(creative);

		// Send the biome definition list packet to the player
		const biome = new BiomeDefinitionList();
		biome.biomes = BiomeDefinitions;
		player.sendPacket(biome);

		// Send the level chunk packet to the player
		player.world.sendChunk(player);

		// Send the play status packet to the player
		// TODO: Change this to a handler, and not use a settimeout
		setTimeout(() => {
			const spawn = new PlayStatus();
			spawn.status = PlayerStatus.PlayerSpawn;
			player.sendPacket(spawn);
		}, 2_000);
	}
}

export { StartGameHandler };
