import {
	Bool,
	Endianness,
	Float32,
	Int16,
	Int32,
	Int64,
	Uint64,
	Uint8,
	VarInt,
	VarLong,
	VarString,
	ZigZag,
	ZigZong,
	Uuid,
} from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Difficulty, Gamemode, Packet as PacketId, PermissionLevel } from '../enums/index.js';
import {
	Vector3f,
	Vector2f,
	BlockCoordinates,
	GameRules,
	Experiments,
	BlockProperties,
	Itemstates,
} from '../types/index.js';

@Packet(PacketId.StartGame)
class StartGame extends DataPacket {
	@Serialize(ZigZong) public entityId!: bigint;
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(ZigZag) public playerGamemode!: Gamemode;
	@Serialize(Vector3f) public playerPosition!: Vector3f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Uint64, Endianness.Little) public seed!: bigint;
	@Serialize(Int16, Endianness.Little) public biomeType!: number;
	@Serialize(VarString) public biomeName!: string;
	@Serialize(ZigZag) public dimension!: number;
	@Serialize(ZigZag) public generator!: number;
	@Serialize(ZigZag) public worldGamemode!: Gamemode;
	@Serialize(ZigZag) public difficulty!: Difficulty;
	@Serialize(BlockCoordinates) public spawnPosition!: BlockCoordinates;
	@Serialize(Bool) public achievementsDisabled!: boolean;
	@Serialize(ZigZag) public editorWorldType!: number;
	@Serialize(Bool) public createdInEdior!: boolean;
	@Serialize(Bool) public exportedFromEdior!: boolean;
	@Serialize(ZigZag) public dayCycleStopTime!: number;
	@Serialize(ZigZag) public eduOffer!: number;
	@Serialize(Bool) public eduFeatures!: boolean;
	@Serialize(VarString) public eduProductUuid!: string;
	@Serialize(Float32, Endianness.Little) public rainLevel!: number;
	@Serialize(Float32, Endianness.Little) public lightningLevel!: number;
	@Serialize(Bool) public confirmedPlatformLockedContent!: boolean;
	@Serialize(Bool) public multiplayerGame!: boolean;
	@Serialize(Bool) public broadcastToLan!: boolean;
	@Serialize(VarInt) public xblBroadcastMode!: number;
	@Serialize(VarInt) public platformBroadcastMode!: number;
	@Serialize(Bool) public commandsEnabled!: boolean;
	@Serialize(Bool) public texturePacksRequired!: boolean;
	@Serialize(GameRules) public gamerules!: GameRules[];
	@Serialize(Experiments) public experiments!: Experiments[];
	@Serialize(Bool) public experimentsPreviouslyToggled!: boolean;
	@Serialize(Bool) public bonusChest!: boolean;
	@Serialize(Bool) public mapEnabled!: boolean;
	@Serialize(Uint8) public permissionLevel!: PermissionLevel;
	@Serialize(Int32, Endianness.Little) public serverChunkTickRange!: number;
	@Serialize(Bool) public hasLockedBehaviorPack!: boolean;
	@Serialize(Bool) public hasLockedResourcePack!: boolean;
	@Serialize(Bool) public isFromLockedWorldTemplate!: boolean;
	@Serialize(Bool) public useMsaGamertagsOnly!: boolean;
	@Serialize(Bool) public isFromWorldTemplate!: boolean;
	@Serialize(Bool) public isWorldTemplateOptionLocked!: boolean;
	@Serialize(Bool) public onlySpawnV1Villagers!: boolean;
	@Serialize(Bool) public personaDisabled!: boolean;
	@Serialize(Bool) public customSkinsDisabled!: boolean;
	@Serialize(Bool) public emoteChatMuted!: boolean;
	@Serialize(VarString) public gameVersion!: string;
	@Serialize(Int32, Endianness.Little) public limitedWorldWidth!: number;
	@Serialize(Int32, Endianness.Little) public limitedWorldLength!: number;
	@Serialize(Bool) public isNewNether!: boolean;
	@Serialize(VarString) public eduResourceUriButtonName!: string;
	@Serialize(VarString) public eduResourceUriLink!: string;
	@Serialize(Bool) public experimentalGameplayOverride!: boolean;
	@Serialize(Uint8) public chatRestrictionLevel!: number;
	@Serialize(Bool) public disablePlayerInteractions!: boolean;
	@Serialize(VarString) public levelId!: string;
	@Serialize(VarString) public worldName!: string;
	@Serialize(VarString) public premiumWorldTemplateId!: string;
	@Serialize(Bool) public isTrial!: boolean;
	@Serialize(ZigZag) public movementAuthority!: number;
	@Serialize(ZigZag) public rewindHistorySize!: number;
	@Serialize(Bool) public serverAuthoritativeBlockBreaking!: boolean;
	@Serialize(Int64, Endianness.Little) public currentTick!: bigint;
	@Serialize(ZigZag) public enchantmentSeed!: number;
	@Serialize(BlockProperties) public blockProperties!: BlockProperties[];
	@Serialize(Itemstates) public itemstates!: Itemstates[];
	@Serialize(VarString) public multiplayerCorrelationId!: string;
	@Serialize(Bool) public serverAuthoritativeInventory!: boolean;
	@Serialize(VarString) public engine!: string;
	@Serialize(Uint8) public propertyData1!: any; // TODO
	@Serialize(Uint8) public propertyData2!: any; // TODO -> This is a single property, but is a nbt stream.
	@Serialize(Uint8) public propertyData3!: any; // TODO
	@Serialize(Uint64, Endianness.Little) public blockPaletteChecksum!: bigint;
	@Serialize(Uuid) public worldTemplateId!: string;
	@Serialize(Bool) public clientSideGeneration!: boolean;
	@Serialize(Bool) public blockNetworkIdsAreHashes!: boolean;
	@Serialize(Bool) public serverControlledSounds!: boolean;
}

export { StartGame };
