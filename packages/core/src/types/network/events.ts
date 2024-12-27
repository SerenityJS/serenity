import type {
  DeathInfoPacket,
  RemoveObjectivePacket,
  SetDisplayObjectivePacket,
  SetScorePacket,
  AddItemActorPacket,
  AddEntityPacket,
  AddPlayerPacket,
  AnimatePacket,
  AvailableCommandsPacket,
  BiomeDefinitionListPacket,
  BlockPickRequestPacket,
  ChangeDimensionPacket,
  ChunkRadiusUpdatePacket,
  CommandOutputPacket,
  CommandRequestPacket,
  ContainerClosePacket,
  ContainerOpenPacket,
  CreativeContentPacket,
  DisconnectPacket,
  InteractPacket,
  InventoryContentPacket,
  InventorySlotPacket,
  InventoryTransactionPacket,
  ItemComponentPacket,
  ItemStackRequestPacket,
  ItemStackResponsePacket,
  LevelChunkPacket,
  LevelEventPacket,
  LevelSoundEventPacket,
  LoginPacket,
  MobEquipmentPacket,
  ModalFormRequestPacket,
  ModalFormResponsePacket,
  MoveActorAbsolutePacket,
  MovePlayerPacket,
  NetworkChunkPublisherUpdatePacket,
  NetworkSettingsPacket,
  Packet,
  PacketViolationWarningPacket,
  PlayStatusPacket,
  PlayerActionPacket,
  PlayerAuthInputPacket,
  PlayerHotbarPacket,
  PlayerListPacket,
  RemoveEntityPacket,
  RequestChunkRadiusPacket,
  RequestNetworkSettingsPacket,
  ResourcePackChunkDataPacket,
  ResourcePackChunkRequestPacket,
  ResourcePackClientResponsePacket,
  ResourcePackDataInfoPacket,
  ResourcePackStackPacket,
  ResourcePacksInfoPacket,
  RespawnPacket,
  ScriptMessagePacket,
  SetActorMotionPacket,
  SetCommandsEnabledPacket,
  SetActorDataPacket,
  SetLocalPlayerAsInitializedPacket,
  SetPlayerGameTypePacket,
  SetTitlePacket,
  SetHudPacket,
  StartGamePacket,
  TextPacket,
  ToastRequestPacket,
  UpdateAbilitiesPacket,
  UpdateAdventureSettingsPacket,
  UpdateAttributesPacket,
  UpdateBlockPacket,
  SetTimePacket,
  SetScoreboardIdentityPacket,
  TransferPacket,
  TakeItemActorPacket,
  NetworkStackLatencyPacket,
  BossEventPacket,
  NpcDialoguePacket,
  ActorEventPacket,
  AnimateEntityPacket,
  EmoteListPacket,
  EmotePacket,
  PlayerSkinPacket,
  BlockActorDataPacket,
  AwardAchievementPacket,
  ServerToClientHandshakePacket,
  ClientboundCloseFormPacket,
  MobEffectPacket,
  SetPlayerInventoryOptionsPacket,
  CompletedUsingItemPacket,
  NpcRequestPacket,
  OpenSignPacket,
  ServerboundLoadingScreenPacketPacket,
  CameraShakePacket,
  BookEditPacket,
  PlayerStartItemCooldownPacket,
  CameraInstructionsPacket,
  CameraPresetsPacket,
  CraftingDataPacket,
  SpawnParticleEffectPacket,
  ContainerSetDataPacket,
  AvailableActorIdentifiersPacket,
  StructureBlockUpdatePacket,
  DimensionDataPacket,
  PlayerEnchantOptionsPacket,
  ClientToServerHandshakePacket,
  MobArmorEquipmentPacket,
  RiderJumpPacket,
  BlockEventPacket,
  EntityPickRequestPacket,
  HurtArmorPacket,
  ShowCreditsPacket,
  UpdateClientInputLocksPacket,
  OnScreenTextureAnimationPacket,
  ServerboundDiagnosticsPacket,
  PlaySoundPacket,
  SetActorLinkPacket,
  StopSoundPacket,
  DataPacket,
  MoveActorDeltaPacket,
  PlayerFogPacket,
  CurrectStructureFeaturePacket,
  GameRulesChangedPacket,
  LegacyTelemetryEventPacket,
  LevelEventGenericPacket,
  SetDifficultyPacket,
  SetHealthPacket,
  SetSpawnPositionPacket,
  SyncActorPropertyPacket,
  TrimDataPacket,
  UnlockedRecipesPacket,
  RequestPermissionsPacket,
  ServerSettingsResponsePacket,
  CommandBlockUpdatePacket,
  ShowProfilePacket,
  DebugInfoPacket,
  ClientBoundDebugRendererPacket,
  CorrectPlayerMovePredictionPacket,
  MovementEffectPacket,
  ClientBoundMapItemDataPacket,
  MapInfoRequestPacket,
  UpdateTradePacket
} from "@serenityjs/protocol";
import type { NetworkPacketEvent } from "./packet-event";

/**
 * All available network events.
 */
interface NetworkEvents {
  all: [NetworkPacketEvent<DataPacket>];
  [Packet.Login]: [NetworkPacketEvent<LoginPacket>];
  [Packet.PlayStatus]: [NetworkPacketEvent<PlayStatusPacket>];
  [Packet.ServerToClientHandshake]: [
    NetworkPacketEvent<ServerToClientHandshakePacket>
  ];
  [Packet.ClientToServerHandshake]: [
    NetworkPacketEvent<ClientToServerHandshakePacket>
  ];
  [Packet.Disconnect]: [NetworkPacketEvent<DisconnectPacket>];
  [Packet.ResourcePacksInfo]: [NetworkPacketEvent<ResourcePacksInfoPacket>];
  [Packet.ResourcePackStack]: [NetworkPacketEvent<ResourcePackStackPacket>];
  [Packet.ResourcePackClientResponse]: [
    NetworkPacketEvent<ResourcePackClientResponsePacket>
  ];
  [Packet.Text]: [NetworkPacketEvent<TextPacket>];
  [Packet.SetTime]: [NetworkPacketEvent<SetTimePacket>];
  [Packet.StartGame]: [NetworkPacketEvent<StartGamePacket>];
  [Packet.AddPlayer]: [NetworkPacketEvent<AddPlayerPacket>];
  [Packet.AddEntity]: [NetworkPacketEvent<AddEntityPacket>];
  [Packet.RemoveEntity]: [NetworkPacketEvent<RemoveEntityPacket>];
  [Packet.AddItemActor]: [NetworkPacketEvent<AddItemActorPacket>];
  [Packet.TakeItemActor]: [NetworkPacketEvent<TakeItemActorPacket>];
  [Packet.MoveActorAbsolute]: [NetworkPacketEvent<MoveActorAbsolutePacket>];
  [Packet.MovePlayer]: [NetworkPacketEvent<MovePlayerPacket>];
  [Packet.RiderJump]: [NetworkPacketEvent<RiderJumpPacket>];
  [Packet.UpdateBlock]: [NetworkPacketEvent<UpdateBlockPacket>];
  [Packet.LevelEvent]: [NetworkPacketEvent<LevelEventPacket>];
  [Packet.BlockEvent]: [NetworkPacketEvent<BlockEventPacket>];
  [Packet.ActorEvent]: [NetworkPacketEvent<ActorEventPacket>];
  [Packet.UpdateAttributes]: [NetworkPacketEvent<UpdateAttributesPacket>];
  [Packet.InventoryTransaction]: [
    NetworkPacketEvent<InventoryTransactionPacket>
  ];
  [Packet.SetActorLink]: [NetworkPacketEvent<SetActorLinkPacket>];
  [Packet.CompletedUsingItem]: [NetworkPacketEvent<CompletedUsingItemPacket>];
  [Packet.MobEquipment]: [NetworkPacketEvent<MobEquipmentPacket>];
  [Packet.MobArmorEquipment]: [NetworkPacketEvent<MobArmorEquipmentPacket>];
  [Packet.MobEffect]: [NetworkPacketEvent<MobEffectPacket>];
  [Packet.Interact]: [NetworkPacketEvent<InteractPacket>];
  [Packet.BlockPickRequest]: [NetworkPacketEvent<BlockPickRequestPacket>];
  [Packet.BookEdit]: [NetworkPacketEvent<BookEditPacket>];
  [Packet.PlayerStartItemCooldown]: [
    NetworkPacketEvent<PlayerStartItemCooldownPacket>
  ];
  [Packet.EntityPickRequest]: [NetworkPacketEvent<EntityPickRequestPacket>];
  [Packet.PlayerAction]: [NetworkPacketEvent<PlayerActionPacket>];
  [Packet.HurtArmor]: [NetworkPacketEvent<HurtArmorPacket>];
  [Packet.SetActorData]: [NetworkPacketEvent<SetActorDataPacket>];
  [Packet.SetActorMotion]: [NetworkPacketEvent<SetActorMotionPacket>];
  [Packet.Animate]: [NetworkPacketEvent<AnimatePacket>];
  [Packet.Respawn]: [NetworkPacketEvent<RespawnPacket>];
  [Packet.ContainerOpen]: [NetworkPacketEvent<ContainerOpenPacket>];
  [Packet.ContainerClose]: [NetworkPacketEvent<ContainerClosePacket>];
  [Packet.PlayerHotbar]: [NetworkPacketEvent<PlayerHotbarPacket>];
  [Packet.InventoryContent]: [NetworkPacketEvent<InventoryContentPacket>];
  [Packet.InventorySlot]: [NetworkPacketEvent<InventorySlotPacket>];
  [Packet.ContainerSetData]: [NetworkPacketEvent<ContainerSetDataPacket>];
  [Packet.CraftingData]: [NetworkPacketEvent<CraftingDataPacket>];
  [Packet.BlockActorData]: [NetworkPacketEvent<BlockActorDataPacket>];
  [Packet.LevelChunk]: [NetworkPacketEvent<LevelChunkPacket>];
  [Packet.SetCommandsEnabled]: [NetworkPacketEvent<SetCommandsEnabledPacket>];
  [Packet.ChangeDimension]: [NetworkPacketEvent<ChangeDimensionPacket>];
  [Packet.SetPlayerGameType]: [NetworkPacketEvent<SetPlayerGameTypePacket>];
  [Packet.PlayerList]: [NetworkPacketEvent<PlayerListPacket>];
  [Packet.RequestChunkRadius]: [NetworkPacketEvent<RequestChunkRadiusPacket>];
  [Packet.ChunkRadiusUpdate]: [NetworkPacketEvent<ChunkRadiusUpdatePacket>];
  [Packet.GameRulesChanged]: [NetworkPacketEvent<GameRulesChangedPacket>];
  [Packet.BossEvent]: [NetworkPacketEvent<BossEventPacket>];
  [Packet.LegacyTelemetryEvent]: [
    NetworkPacketEvent<LegacyTelemetryEventPacket>
  ];
  [Packet.AvailableCommands]: [NetworkPacketEvent<AvailableCommandsPacket>];
  [Packet.CommandRequest]: [NetworkPacketEvent<CommandRequestPacket>];
  [Packet.CommandBlockUpdate]: [NetworkPacketEvent<CommandBlockUpdatePacket>];
  [Packet.CommandOutput]: [NetworkPacketEvent<CommandOutputPacket>];
  [Packet.ResourcePackDataInfo]: [
    NetworkPacketEvent<ResourcePackDataInfoPacket>
  ];
  [Packet.SetSpawnPosition]: [NetworkPacketEvent<SetSpawnPositionPacket>];
  [Packet.StructureBlockUpdate]: [
    NetworkPacketEvent<StructureBlockUpdatePacket>
  ];
  [Packet.SetHealth]: [NetworkPacketEvent<SetHealthPacket>];
  [Packet.SetDifficulty]: [NetworkPacketEvent<SetDifficultyPacket>];
  [Packet.DimensionData]: [NetworkPacketEvent<DimensionDataPacket>];
  [Packet.CameraInstructions]: [NetworkPacketEvent<CameraInstructionsPacket>];
  [Packet.ResourcePackChunkData]: [
    NetworkPacketEvent<ResourcePackChunkDataPacket>
  ];
  [Packet.TrimData]: [NetworkPacketEvent<TrimDataPacket>];
  [Packet.ShowCredits]: [NetworkPacketEvent<ShowCreditsPacket>];
  [Packet.CameraPresetsPacket]: [NetworkPacketEvent<CameraPresetsPacket>];
  [Packet.ResourcePackChunkRequest]: [
    NetworkPacketEvent<ResourcePackChunkRequestPacket>
  ];
  [Packet.UnlockedRecipes]: [NetworkPacketEvent<UnlockedRecipesPacket>];
  [Packet.Transfer]: [NetworkPacketEvent<TransferPacket>];
  [Packet.PlaySound]: [NetworkPacketEvent<PlaySoundPacket>];
  [Packet.SetTitle]: [NetworkPacketEvent<SetTitlePacket>];
  [Packet.PlayerSkin]: [NetworkPacketEvent<PlayerSkinPacket>];
  [Packet.NpcRequest]: [NetworkPacketEvent<NpcRequestPacket>];
  [Packet.OpenSign]: [NetworkPacketEvent<OpenSignPacket>];
  [Packet.CameraShake]: [NetworkPacketEvent<CameraShakePacket>];
  [Packet.PlayerFog]: [NetworkPacketEvent<PlayerFogPacket>];
  [Packet.ModalFormRequest]: [NetworkPacketEvent<ModalFormRequestPacket>];
  [Packet.ModalFormResponse]: [NetworkPacketEvent<ModalFormResponsePacket>];
  [Packet.ServerSettingsResponse]: [
    NetworkPacketEvent<ServerSettingsResponsePacket>
  ];
  [Packet.ShowProfile]: [NetworkPacketEvent<ShowProfilePacket>];
  [Packet.RemoveObjective]: [NetworkPacketEvent<RemoveObjectivePacket>];
  [Packet.SetDisplayObjective]: [NetworkPacketEvent<SetDisplayObjectivePacket>];
  [Packet.SetScore]: [NetworkPacketEvent<SetScorePacket>];
  [Packet.MoveActorDelta]: [NetworkPacketEvent<MoveActorDeltaPacket>];
  [Packet.SetScoreboardIdentity]: [
    NetworkPacketEvent<SetScoreboardIdentityPacket>
  ];
  [Packet.NetworkStackLatency]: [NetworkPacketEvent<NetworkStackLatencyPacket>];
  [Packet.AvailableActorIdentifiers]: [
    NetworkPacketEvent<AvailableActorIdentifiersPacket>
  ];
  [Packet.SpawnParticleEffect]: [NetworkPacketEvent<SpawnParticleEffectPacket>];
  [Packet.SetLocalPlayerAsInitialized]: [
    NetworkPacketEvent<SetLocalPlayerAsInitializedPacket>
  ];
  [Packet.NetworkChunkPublisherUpdate]: [
    NetworkPacketEvent<NetworkChunkPublisherUpdatePacket>
  ];
  [Packet.BiomeDefinitionList]: [NetworkPacketEvent<BiomeDefinitionListPacket>];
  [Packet.LevelSoundEvent]: [NetworkPacketEvent<LevelSoundEventPacket>];
  [Packet.LevelEventGeneric]: [NetworkPacketEvent<LevelEventGenericPacket>];
  [Packet.OnScreenTextureAnimation]: [
    NetworkPacketEvent<OnScreenTextureAnimationPacket>
  ];
  [Packet.StopSound]: [NetworkPacketEvent<StopSoundPacket>];
  [Packet.Emote]: [NetworkPacketEvent<EmotePacket>];
  [Packet.NetworkSettings]: [NetworkPacketEvent<NetworkSettingsPacket>];
  [Packet.PlayerAuthInput]: [NetworkPacketEvent<PlayerAuthInputPacket>];
  [Packet.CreativeContent]: [NetworkPacketEvent<CreativeContentPacket>];
  [Packet.PlayerEnchantOptions]: [
    NetworkPacketEvent<PlayerEnchantOptionsPacket>
  ];
  [Packet.SyncActorProperty]: [NetworkPacketEvent<SyncActorPropertyPacket>];
  [Packet.ItemStackRequest]: [NetworkPacketEvent<ItemStackRequestPacket>];
  [Packet.ItemStackResponse]: [NetworkPacketEvent<ItemStackResponsePacket>];
  [Packet.EmoteList]: [NetworkPacketEvent<EmoteListPacket>];
  [Packet.DebugInfo]: [NetworkPacketEvent<DebugInfoPacket>];
  [Packet.PacketViolationWarning]: [
    NetworkPacketEvent<PacketViolationWarningPacket>
  ];
  [Packet.AnimateEntity]: [NetworkPacketEvent<AnimateEntityPacket>];
  [Packet.CorrectPlayerMovePrediction]: [
    NetworkPacketEvent<CorrectPlayerMovePredictionPacket>
  ];
  [Packet.ClientBoundMapItemData]: [
    NetworkPacketEvent<ClientBoundMapItemDataPacket>
  ];
  [Packet.MapInfoRequest]: [NetworkPacketEvent<MapInfoRequestPacket>];
  [Packet.ItemComponent]: [NetworkPacketEvent<ItemComponentPacket>];
  [Packet.ClientBoundDebugRenderer]: [
    NetworkPacketEvent<ClientBoundDebugRendererPacket>
  ];
  [Packet.UpdateTrade]: [NetworkPacketEvent<UpdateTradePacket>];
  [Packet.NpcDialogue]: [NetworkPacketEvent<NpcDialoguePacket>];
  [Packet.ScriptMessage]: [NetworkPacketEvent<ScriptMessagePacket>];
  [Packet.RequestPermissions]: [NetworkPacketEvent<RequestPermissionsPacket>];
  [Packet.ToastRequest]: [NetworkPacketEvent<ToastRequestPacket>];
  [Packet.UpdateAbilities]: [NetworkPacketEvent<UpdateAbilitiesPacket>];
  [Packet.UpdateAdventureSettings]: [
    NetworkPacketEvent<UpdateAdventureSettingsPacket>
  ];
  [Packet.DeathInfo]: [NetworkPacketEvent<DeathInfoPacket>];
  [Packet.RequestNetworkSettings]: [
    NetworkPacketEvent<RequestNetworkSettingsPacket>
  ];
  [Packet.SetPlayerInventoryOptions]: [
    NetworkPacketEvent<SetPlayerInventoryOptionsPacket>
  ];
  [Packet.SetHud]: [NetworkPacketEvent<SetHudPacket>];
  [Packet.AwardAchievement]: [NetworkPacketEvent<AwardAchievementPacket>];
  [Packet.ClientboundCloseForm]: [
    NetworkPacketEvent<ClientboundCloseFormPacket>
  ];
  [Packet.ServerboundLoadingScreenPacket]: [
    NetworkPacketEvent<ServerboundLoadingScreenPacketPacket>
  ];
  [Packet.UpdateClientInputLocks]: [
    NetworkPacketEvent<UpdateClientInputLocksPacket>
  ];
  [Packet.CurrentStructureFeature]: [
    NetworkPacketEvent<CurrectStructureFeaturePacket>
  ];
  [Packet.ServerboundDiagnosticPacket]: [
    NetworkPacketEvent<ServerboundDiagnosticsPacket>
  ];
  [Packet.MovementEffect]: [NetworkPacketEvent<MovementEffectPacket>];
}

export { NetworkEvents };
