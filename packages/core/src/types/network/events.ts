import type {
  ActorEventPacket,
  AddBehaviorTreePacket,
  AddEntityPacket,
  AddItemActorPacket,
  AddPaintingPacket,
  AddPlayerPacket,
  AgentActionEventPacket,
  AnimateEntityPacket,
  AnimatePacket,
  AvailableActorIdentifiersPacket,
  AvailableCommandsPacket,
  AutomationClientConnectPacket,
  AwardAchievementPacket,
  BiomeDefinitionListPacket,
  BlockActorDataPacket,
  BlockEventPacket,
  BlockPickRequestPacket,
  BookEditPacket,
  BossEventPacket,
  CameraInstructionsPacket,
  CameraPresetsPacket,
  CameraShakePacket,
  ChangeDimensionPacket,
  ChangeMobPropertyPacket,
  ChunkRadiusUpdatePacket,
  ClientBoundDebugRendererPacket,
  ClientBoundMapItemDataPacket,
  ClientCacheStatusPacket,
  ClientToServerHandshakePacket,
  ClientboundCloseFormPacket,
  CodeBuilderSourcePacket,
  CommandBlockUpdatePacket,
  CommandOutputPacket,
  CommandRequestPacket,
  CompletedUsingItemPacket,
  ContainerClosePacket,
  ContainerOpenPacket,
  ContainerSetDataPacket,
  CorrectPlayerMovePredictionPacket,
  CraftingDataPacket,
  CreativeContentPacket,
  CreatePhotoPacket,
  CurrectStructureFeaturePacket,
  DataPacket,
  DeathInfoPacket,
  DebugInfoPacket,
  DimensionDataPacket,
  DisconnectPacket,
  EmoteListPacket,
  EmotePacket,
  EntityPickRequestPacket,
  EduUriResourcePacket,
  GameRulesChangedPacket,
  GraphicsOverrideParameterPacket,
  GuiDataPickItemPacket,
  HurtArmorPacket,
  InteractPacket,
  InventoryContentPacket,
  InventorySlotPacket,
  InventoryTransactionPacket,
  ItemRegistryPacket,
  ItemStackRequestPacket,
  ItemStackResponsePacket,
  LabTablePacket,
  LegacyTelemetryEventPacket,
  LessonProgressPacket,
  LevelChunkPacket,
  LevelEventGenericPacket,
  LevelEventPacket,
  LevelSoundEventPacket,
  LoginPacket,
  MapInfoRequestPacket,
  MobArmorEquipmentPacket,
  MobEffectPacket,
  MobEquipmentPacket,
  ModalFormRequestPacket,
  ModalFormResponsePacket,
  MotionPredictHintsPacket,
  MoveActorAbsolutePacket,
  MoveActorDeltaPacket,
  MovePlayerPacket,
  MovementEffectPacket,
  NetworkChunkPublisherUpdatePacket,
  NetworkSettingsPacket,
  NetworkStackLatencyPacket,
  NpcDialoguePacket,
  NpcRequestPacket,
  OnScreenTextureAnimationPacket,
  OpenSignPacket,
  Packet,
  PacketViolationWarningPacket,
  PhotoTransferPacket,
  PlaySoundPacket,
  PlayStatusPacket,
  PlayerActionPacket,
  PlayerAuthInputPacket,
  PlayerEnchantOptionsPacket,
  PlayerFogPacket,
  PlayerHotbarPacket,
  PlayerListPacket,
  PlayerSkinPacket,
  PlayerStartItemCooldownPacket,
  PlayerToggleCrafterRequestPacket,
  PlayerUpdateEntityOverridesPacket,
  PurchaseReceiptPacket,
  RemoveEntityPacket,
  RemoveObjectivePacket,
  RequestChunkRadiusPacket,
  RequestNetworkSettingsPacket,
  RequestPermissionsPacket,
  ResourcePackChunkDataPacket,
  ResourcePackChunkRequestPacket,
  ResourcePackClientResponsePacket,
  ResourcePackDataInfoPacket,
  ResourcePackStackPacket,
  ResourcePacksInfoPacket,
  RespawnPacket,
  RiderJumpPacket,
  ScriptMessagePacket,
  ServerScriptDebugDrawerPacket,
  ServerSettingsRequestPacket,
  ServerSettingsResponsePacket,
  ServerToClientHandshakePacket,
  ServerboundDiagnosticsPacket,
  ServerboundLoadingScreenPacketPacket,
  SetActorDataPacket,
  SetActorLinkPacket,
  SetActorMotionPacket,
  SetCommandsEnabledPacket,
  SetDefaultGamemodePacket,
  SetDifficultyPacket,
  SetDisplayObjectivePacket,
  SetHealthPacket,
  SetHudPacket,
  SetLastHurtByPacket,
  SetLocalPlayerAsInitializedPacket,
  SetPlayerGameTypePacket,
  SetPlayerInventoryOptionsPacket,
  SetScorePacket,
  SetScoreboardIdentityPacket,
  SetSpawnPositionPacket,
  SetTimePacket,
  SetTitlePacket,
  SimpleEventPacket,
  ShowCreditsPacket,
  ShowProfilePacket,
  ShowStoreOfferPacket,
  SpawnParticleEffectPacket,
  SpawnExperienceOrbPacket,
  StartGamePacket,
  StopSoundPacket,
  StructureBlockUpdatePacket,
  SubChunkPacket,
  SubChunkRequestPacket,
  SyncActorPropertyPacket,
  TakeItemActorPacket,
  TextPacket,
  TickingAreasLoadStatusPacket,
  ToastRequestPacket,
  TransferPacket,
  TrimDataPacket,
  UnlockedRecipesPacket,
  UpdateAbilitiesPacket,
  UpdateAdventureSettingsPacket,
  UpdateAttributesPacket,
  UpdateBlockPacket,
  UpdateBlockSyncPacket,
  UpdateClientInputLocksPacket,
  UpdateEquipPacket,
  UpdatePlayerGameTypePacket,
  UpdateSoftEnumPacket,
  UpdateSubchunkBlocksPacket,
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
  [Packet.ItemRegistry]: [NetworkPacketEvent<ItemRegistryPacket>];
  [Packet.ClientBoundDebugRenderer]: [
    NetworkPacketEvent<ClientBoundDebugRendererPacket>
  ];
  [Packet.UpdateTrade]: [NetworkPacketEvent<UpdateTradePacket>];
  [Packet.NpcDialogue]: [NetworkPacketEvent<NpcDialoguePacket>];
  [Packet.SubChunk]: [NetworkPacketEvent<SubChunkPacket>];
  [Packet.SubChunkRequest]: [NetworkPacketEvent<SubChunkRequestPacket>];
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
  [Packet.UpdateSubchunkBlocks]: [
    NetworkPacketEvent<UpdateSubchunkBlocksPacket>
  ];
  [Packet.UpdateBlockSync]: [NetworkPacketEvent<UpdateBlockSyncPacket>];
  [Packet.SetLastHurtBy]: [NetworkPacketEvent<SetLastHurtByPacket>];
  [Packet.UpdatePlayerGameType]: [
    NetworkPacketEvent<UpdatePlayerGameTypePacket>
  ];
  [Packet.SetDefaultGamemode]: [NetworkPacketEvent<SetDefaultGamemodePacket>];
  [Packet.MotionPredictHints]: [NetworkPacketEvent<MotionPredictHintsPacket>];
  [Packet.ClientCacheStatus]: [NetworkPacketEvent<ClientCacheStatusPacket>];
  [Packet.AddPainting]: [NetworkPacketEvent<AddPaintingPacket>];
  [Packet.PlayerUpdateEntityOverrides]: [
    NetworkPacketEvent<PlayerUpdateEntityOverridesPacket>
  ];
  [Packet.ServerScriptDebugDrawer]: [
    NetworkPacketEvent<ServerScriptDebugDrawerPacket>
  ];
  [Packet.GraphicsOverrideParameter]: [
    NetworkPacketEvent<GraphicsOverrideParameterPacket>
  ];
  [Packet.PurchaseReceipt]: [NetworkPacketEvent<PurchaseReceiptPacket>];
  [Packet.AutomationClientConnect]: [
    NetworkPacketEvent<AutomationClientConnectPacket>
  ];
  [Packet.ShowStoreOffer]: [NetworkPacketEvent<ShowStoreOfferPacket>];
  [Packet.SimpleEvent]: [NetworkPacketEvent<SimpleEventPacket>];
  [Packet.SpawnExperienceOrb]: [NetworkPacketEvent<SpawnExperienceOrbPacket>];
  [Packet.AddBehaviorTree]: [NetworkPacketEvent<AddBehaviorTreePacket>];
  [Packet.PhotoTransfer]: [NetworkPacketEvent<PhotoTransferPacket>];
  [Packet.UpdateSoftEnum]: [NetworkPacketEvent<UpdateSoftEnumPacket>];
  [Packet.LabTable]: [NetworkPacketEvent<LabTablePacket>];
  [Packet.ServerSettingsRequest]: [
    NetworkPacketEvent<ServerSettingsRequestPacket>
  ];
  [Packet.GuiDataPickItem]: [NetworkPacketEvent<GuiDataPickItemPacket>];
  [Packet.UpdateEquip]: [NetworkPacketEvent<UpdateEquipPacket>];
  [Packet.EduUriResource]: [NetworkPacketEvent<EduUriResourcePacket>];
  [Packet.CreatePhoto]: [NetworkPacketEvent<CreatePhotoPacket>];
  [Packet.CodeBuilderSource]: [NetworkPacketEvent<CodeBuilderSourcePacket>];
  [Packet.TickingAreasLoadStatus]: [
    NetworkPacketEvent<TickingAreasLoadStatusPacket>
  ];
  [Packet.AgentActionEvent]: [NetworkPacketEvent<AgentActionEventPacket>];
  [Packet.ChangeMobProperty]: [NetworkPacketEvent<ChangeMobPropertyPacket>];
  [Packet.LessonProgress]: [NetworkPacketEvent<LessonProgressPacket>];
  [Packet.EditorNetwork]: [NetworkPacketEvent<DataPacket>];
  [Packet.FeatureRegistry]: [NetworkPacketEvent<DataPacket>];
  [Packet.ServerStats]: [NetworkPacketEvent<DataPacket>];
  [Packet.GameTestRequest]: [NetworkPacketEvent<DataPacket>];
  [Packet.GameTestResponse]: [NetworkPacketEvent<DataPacket>];
  [Packet.AgentAnimation]: [NetworkPacketEvent<DataPacket>];
  [Packet.PlayerToggleCrafterRequest]: [
    NetworkPacketEvent<PlayerToggleCrafterRequestPacket>
  ];
}

export { NetworkEvents };
