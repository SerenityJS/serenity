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
  ZigZong
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import {
  type Difficulty,
  type Gamemode,
  Packet,
  type PermissionLevel
} from "../../enums";
import {
  Uuid,
  Vector3f,
  BlockPosition,
  GameRules,
  Experiments,
  NetworkBlockTypeDefinition
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.StartGame)
class StartGamePacket extends DataPacket {
  @Serialize(ZigZong) public entityId!: bigint;
  @Serialize(VarLong) public runtimeEntityId!: bigint;
  @Serialize(ZigZag) public playerGamemode!: Gamemode;
  @Serialize(Vector3f) public playerPosition!: Vector3f;
  @Serialize(Float32, { endian: Endianness.Little }) public pitch!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public yaw!: number;
  @Serialize(Uint64, { endian: Endianness.Little }) public seed!: bigint;
  @Serialize(Int16, { endian: Endianness.Little }) public biomeType!: number;
  @Serialize(VarString) public biomeName!: string;
  @Serialize(ZigZag) public dimension!: number;
  @Serialize(ZigZag) public generator!: number;
  @Serialize(ZigZag) public worldGamemode!: Gamemode;
  @Serialize(Bool) public hardcore!: boolean;
  @Serialize(ZigZag) public difficulty!: Difficulty;
  @Serialize(BlockPosition) public spawnPosition!: BlockPosition;
  @Serialize(Bool) public achievementsDisabled!: boolean;
  @Serialize(ZigZag) public editorWorldType!: number;
  @Serialize(Bool) public createdInEdior!: boolean;
  @Serialize(Bool) public exportedFromEdior!: boolean;
  @Serialize(ZigZag) public dayCycleStopTime!: number;
  @Serialize(ZigZag) public eduOffer!: number;
  @Serialize(Bool) public eduFeatures!: boolean;
  @Serialize(VarString) public eduProductUuid!: string;
  @Serialize(Float32, { endian: Endianness.Little }) public rainLevel!: number;
  @Serialize(Float32, { endian: Endianness.Little })
  public lightningLevel!: number;
  @Serialize(Bool) public confirmedPlatformLockedContent!: boolean;
  @Serialize(Bool) public multiplayerGame!: boolean;
  @Serialize(Bool) public broadcastToLan!: boolean;
  @Serialize(VarInt) public xblBroadcastMode!: number;
  @Serialize(VarInt) public platformBroadcastMode!: number;
  @Serialize(Bool) public commandsEnabled!: boolean;
  @Serialize(Bool) public texturePacksRequired!: boolean;
  @Serialize(GameRules) public gamerules!: Array<GameRules>;
  @Serialize(Experiments) public experiments!: Array<Experiments>;
  @Serialize(Bool) public experimentsPreviouslyToggled!: boolean;
  @Serialize(Bool) public bonusChest!: boolean;
  @Serialize(Bool) public mapEnabled!: boolean;
  @Serialize(Uint8) public permissionLevel!: PermissionLevel;
  @Serialize(Int32, { endian: Endianness.Little })
  public serverChunkTickRange!: number;
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
  @Serialize(Int32, { endian: Endianness.Little })
  public limitedWorldWidth!: number;
  @Serialize(Int32, { endian: Endianness.Little })
  public limitedWorldLength!: number;
  @Serialize(Bool) public isNewNether!: boolean;
  @Serialize(VarString) public eduResourceUriButtonName!: string;
  @Serialize(VarString) public eduResourceUriLink!: string;
  @Serialize(Bool) public experimentalGameplayOverride!: boolean;
  @Serialize(Uint8) public chatRestrictionLevel!: number;
  @Serialize(Bool) public disablePlayerInteractions!: boolean;
  @Serialize(VarString) public serverIdentfier!: string;
  @Serialize(VarString) public worldIdentifier!: string;
  @Serialize(VarString) public scenarioIdentifier!: string;
  @Serialize(VarString) public ownerIdentifier!: string;
  @Serialize(VarString) public levelId!: string;
  @Serialize(VarString) public worldName!: string;
  @Serialize(VarString) public premiumWorldTemplateId!: string;
  @Serialize(Bool) public isTrial!: boolean;
  @Serialize(ZigZag) public rewindHistorySize!: number;
  @Serialize(Bool) public serverAuthoritativeBlockBreaking!: boolean;
  @Serialize(Int64, { endian: Endianness.Little }) public currentTick!: bigint;
  @Serialize(ZigZag) public enchantmentSeed!: number;

  /**
   * The custom block type definitions that will be used in the world.
   */
  @Serialize(NetworkBlockTypeDefinition)
  public blockTypeDefinitions!: Array<NetworkBlockTypeDefinition>;

  @Serialize(VarString) public multiplayerCorrelationId!: string;
  @Serialize(Bool) public serverAuthoritativeInventory!: boolean;
  @Serialize(VarString) public engine!: string;
  @Serialize(CompoundTag, { varint: true }) public properties!: CompoundTag;
  @Serialize(Uint64, { endian: Endianness.Little })
  public blockPaletteChecksum!: bigint;
  @Serialize(Uuid) public worldTemplateId!: string;
  @Serialize(Bool) public clientSideGeneration!: boolean;
  @Serialize(Bool) public blockNetworkIdsAreHashes!: boolean;
  @Serialize(Bool) public serverControlledSounds!: boolean;
}

export { StartGamePacket };
