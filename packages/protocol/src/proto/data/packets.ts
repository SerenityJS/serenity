// NOTE: Please try to put the packets in the order according to their id. Thx!
// ok 😉 - @bonanoo

import { Packet } from "../../enums";

import { ActorEventPacket } from "./actor-event";
import { AddBehaviorTreePacket } from "./add-behavior-tree";
import { AddEntityPacket } from "./add-entity";
import { AddItemActorPacket } from "./add-item-actor";
import { AddPaintingPacket } from "./add-painting";
import { AddPlayerPacket } from "./add-player";
import { AnimatePacket } from "./animate";
import { AnimateEntityPacket } from "./animate-entity";
import { AvailableActorIdentifiersPacket } from "./available-actor-identifiers";
import { AvailableCommandsPacket } from "./available-commands";
import { AutomationClientConnectPacket } from "./automation-client-connect";
import { AwardAchievementPacket } from "./award-achievement";
import { BiomeDefinitionListPacket } from "./biome-definition-list";
import { BlockActorDataPacket } from "./block-actor-data";
import { BlockEventPacket } from "./block-event";
import { BlockPickRequestPacket } from "./block-pick-request";
import { BookEditPacket } from "./book-edit";
import { BossEventPacket } from "./boss-event";
import { CameraInstructionsPacket } from "./camera-instructions";
import { CameraPresetsPacket } from "./camera-presets";
import { CameraShakePacket } from "./camera-shake";
import { ChangeDimensionPacket } from "./change-dimension";
import { ChunkRadiusUpdatePacket } from "./chunk-radius-update";
import { ClientBoundDebugRendererPacket } from "./client-bound-debug-renderer";
import { ClientBoundMapItemDataPacket } from "./client-bound-map-item-data";
import { ClientCacheStatusPacket } from "./client-cache-status";
import { ClientToServerHandshakePacket } from "./client-to-server-handshake";
import { ClientboundCloseFormPacket } from "./clientbound-close-form";
import { CommandBlockUpdatePacket } from "./command-block-update";
import { CommandOutputPacket } from "./command-output";
import { CommandRequestPacket } from "./command-request";
import { CompletedUsingItemPacket } from "./completed-using-item";
import { ContainerClosePacket } from "./container-close";
import { ContainerOpenPacket } from "./container-open";
import { ContainerSetDataPacket } from "./container-set-data";
import { CorrectPlayerMovePredictionPacket } from "./correct-player-move-prediction";
import { CraftingDataPacket } from "./crafting-data";
import { CreativeContentPacket } from "./creative-content";
import { CurrectStructureFeaturePacket } from "./current-structure-feature";
import { DeathInfoPacket } from "./death-info";
import { DebugInfoPacket } from "./debug-info";
import { DimensionDataPacket } from "./dimension-data";
import { DisconnectPacket } from "./disconnect";
import { EmotePacket } from "./emote";
import { EmoteListPacket } from "./emote-list";
import { EntityPickRequestPacket } from "./entity-pick-request";
import { GraphicsOverrideParameterPacket } from "./graphics-override-parameter";
import { GameRulesChangedPacket } from "./game-rules-changed";
import { HurtArmorPacket } from "./hurt-armor";
import { InteractPacket } from "./interact";
import { InventoryContentPacket } from "./inventory-content";
import { InventorySlotPacket } from "./inventory-slot";
import { InventoryTransactionPacket } from "./inventory-transaction";
import { ItemRegistryPacket } from "./item-registry";
import { ItemStackRequestPacket } from "./item-stack-request";
import { ItemStackResponsePacket } from "./item-stack-response";
import { LabTablePacket } from "./lab-table";
import { LegacyTelemetryEventPacket } from "./legacy-telemetry-event";
import { LevelChunkPacket } from "./level-chunk";
import { LevelEventPacket } from "./level-event";
import { LevelEventGenericPacket } from "./level-event-generic";
import { LevelSoundEventPacket } from "./level-sound-event";
import { LoginPacket } from "./login";
import { MapInfoRequestPacket } from "./map-info-request";
import { MobArmorEquipmentPacket } from "./mob-armor-equipment";
import { MobEffectPacket } from "./mob-effect";
import { MobEquipmentPacket } from "./mob-equipment";
import { ModalFormRequestPacket } from "./modal-form-request";
import { ModalFormResponsePacket } from "./modal-form-response";
import { MotionPredictHintsPacket } from "./motion-prediction-hints";
import { MoveActorAbsolutePacket } from "./move-actor-absolute";
import { MoveActorDeltaPacket } from "./move-actor-delta";
import { MovePlayerPacket } from "./move-player";
import { MovementEffectPacket } from "./movement-effect";
import { NetworkChunkPublisherUpdatePacket } from "./network-chunk-publisher-update";
import { NetworkSettingsPacket } from "./network-settings";
import { NetworkStackLatencyPacket } from "./network-stack-latency";
import { NpcDialoguePacket } from "./npc-dialogue";
import { NpcRequestPacket } from "./npc-request";
import { OnScreenTextureAnimationPacket } from "./on-screen-texture-animation";
import { OpenSignPacket } from "./open-sign";
import { PacketViolationWarningPacket } from "./packet-violation-warning";
import { PhotoTransferPacket } from "./photo-transfer";
import { PlaySoundPacket } from "./play-sound";
import { PlayStatusPacket } from "./play-status";
import { PlayerActionPacket } from "./player-action";
import { PlayerAuthInputPacket } from "./player-auth-input";
import { PlayerEnchantOptionsPacket } from "./player-enchant-options";
import { PlayerFogPacket } from "./player-fog";
import { PlayerHotbarPacket } from "./player-hotbar";
import { PlayerListPacket } from "./player-list";
import { PlayerSkinPacket } from "./player-skin";
import { PlayerStartItemCooldownPacket } from "./player-start-item-cooldown";
import { PlayerUpdateEntityOverridesPacket } from "./player-update-entity-overrides";
import { PurchaseReceiptPacket } from "./purchase-receipt";
import { RemoveEntityPacket } from "./remove-entity";
import { RemoveObjectivePacket } from "./remove-objective";
import { RequestChunkRadiusPacket } from "./request-chunk-radius";
import { RequestNetworkSettingsPacket } from "./request-network-settings";
import { RequestPermissionsPacket } from "./request-permissions";
import { ResourcePackChunkDataPacket } from "./resource-pack-chunk-data";
import { ResourcePackChunkRequestPacket } from "./resource-pack-chunk-request";
import { ResourcePackClientResponsePacket } from "./resource-pack-client-response";
import { ResourcePackDataInfoPacket } from "./resource-pack-data-info";
import { ResourcePackStackPacket } from "./resource-pack-stack";
import { ResourcePacksInfoPacket } from "./resource-packs-info";
import { RespawnPacket } from "./respawn";
import { RiderJumpPacket } from "./rider-jump";
import { ScriptMessagePacket } from "./script-message";
import { ServerboundLoadingScreenPacketPacket } from "./server-bound-loading-screen";
import { ServerScriptDebugDrawerPacket } from "./server-script-debug-drawer";
import { ServerSettingsRequestPacket } from "./server-settings-request";
import { ServerSettingsResponsePacket } from "./server-settings-response";
import { ServerToClientHandshakePacket } from "./server-to-client-handshake";
import { ServerboundDiagnosticsPacket } from "./serverbound-diagnostics";
import { SetActorDataPacket } from "./set-actor-data";
import { SetActorLinkPacket } from "./set-actor-link";
import { SetActorMotionPacket } from "./set-actor-motion";
import { SetCommandsEnabledPacket } from "./set-commands-enabled";
import { SetDefaultGamemodePacket } from "./set-default-gamemode";
import { SetDifficultyPacket } from "./set-difficulty";
import { SetDisplayObjectivePacket } from "./set-display-objective";
import { SetHealthPacket } from "./set-health";
import { SetHudPacket } from "./set-hud";
import { SetLastHurtByPacket } from "./set-last-hurt-by";
import { SetLocalPlayerAsInitializedPacket } from "./set-local-player-as-initialized";
import { SetPlayerGameTypePacket } from "./set-player-game-type";
import { SetPlayerInventoryOptionsPacket } from "./set-player-inventory-options";
import { SetScorePacket } from "./set-score";
import { SetScoreboardIdentityPacket } from "./set-scoreboard-identity";
import { SetSpawnPositionPacket } from "./set-spawn-position";
import { SetTimePacket } from "./set-time";
import { SetTitlePacket } from "./set-title";
import { SimpleEventPacket } from "./simple-event";
import { ShowCreditsPacket } from "./show-credits";
import { ShowProfilePacket } from "./show-profile";
import { ShowStoreOfferPacket } from "./show-store-offer";
import { SpawnParticleEffectPacket } from "./spawn-particle-effect";
import { SpawnExperienceOrbPacket } from "./spawn-experience-orb";
import { StartGamePacket } from "./start-game";
import { StopSoundPacket } from "./stop-sound";
import { StructureBlockUpdatePacket } from "./structure-block-update";
import { SubChunkPacket } from "./subchunk";
import { SubChunkRequestPacket } from "./subchunk-request";
import { SyncActorPropertyPacket } from "./sync-actor-property";
import { TakeItemActorPacket } from "./take-item-actor";
import { TextPacket } from "./text";
import { ToastRequestPacket } from "./toast-request";
import { TransferPacket } from "./transfer";
import { TrimDataPacket } from "./trim-data";
import { UnlockedRecipesPacket } from "./unlocked-recipes";
import { UpdateAbilitiesPacket } from "./update-abilities";
import { UpdateAdventureSettingsPacket } from "./update-adventure-settings";
import { UpdateAttributesPacket } from "./update-attributes";
import { UpdateBlockPacket } from "./update-block";
import { UpdateBlockSyncPacket } from "./update-block-sync";
import { UpdateClientInputLocksPacket } from "./update-client-input-locks";
import { UpdatePlayerGameTypePacket } from "./update-player-game-type";
import { UpdateSoftEnumPacket } from "./update-soft-enum";
import { UpdateSubchunkBlocksPacket } from "./update-subchunk-blocks";
import { UpdateTradePacket } from "./update-trade";
import { GuiDataPickItemPacket } from "./gui-data-pick-item";
import { UpdateEquipPacket } from "./update-equip";
import { EduUriResourcePacket } from "./edu-uri-resource";
import { CreatePhotoPacket } from "./create-photo";
import { TickingAreasLoadStatusPacket } from "./ticking-areas-load-status";
import { AgentActionEventPacket } from "./agent-action-event";
import { ChangeMobPropertyPacket } from "./change-mob-property";
import { LessonProgressPacket } from "./lesson-progress";
import { EditorNetworkPacket } from "./editor-network";
import { FeatureRegistryPacket } from "./feature-registry";
import { ServerStatsPacket } from "./server-stats";
import { GameTestRequestPacket } from "./game-test-request";
import { GameTestResponsePacket } from "./game-test-response";
import { AgentAnimationPacket } from "./agent-animation";
import { PlayerToggleCrafterRequestPacket } from "./player-toggle-crafter-request";
import { CodeBuilderSourcePacket } from "./code-builder-source";

const Packets = {
  [Packet.Login]: LoginPacket, // 1
  [Packet.PlayStatus]: PlayStatusPacket, // 2
  [Packet.ServerToClientHandshake]: ServerToClientHandshakePacket, // 3
  [Packet.ClientToServerHandshake]: ClientToServerHandshakePacket, // 4
  [Packet.Disconnect]: DisconnectPacket, // 5
  [Packet.ResourcePacksInfo]: ResourcePacksInfoPacket, // 6
  [Packet.ResourcePackStack]: ResourcePackStackPacket, // 7
  [Packet.ResourcePackClientResponse]: ResourcePackClientResponsePacket, // 8
  [Packet.Text]: TextPacket, // 9
  [Packet.SetTime]: SetTimePacket, // 10
  [Packet.StartGame]: StartGamePacket, // 11
  [Packet.AddPlayer]: AddPlayerPacket, // 12
  [Packet.AddEntity]: AddEntityPacket, // 13
  [Packet.RemoveEntity]: RemoveEntityPacket, // 14
  [Packet.AddItemActor]: AddItemActorPacket, // 15
  [Packet.TakeItemActor]: TakeItemActorPacket, // 17
  [Packet.MoveActorAbsolute]: MoveActorAbsolutePacket, // 18
  [Packet.MovePlayer]: MovePlayerPacket, // 19
  [Packet.RiderJump]: RiderJumpPacket, // 20
  [Packet.UpdateBlock]: UpdateBlockPacket, // 21
  [Packet.AddPainting]: AddPaintingPacket, // 22
  [Packet.LevelEvent]: LevelEventPacket, // 25
  [Packet.BlockEvent]: BlockEventPacket, // 26
  [Packet.ActorEvent]: ActorEventPacket, // 27
  [Packet.MobEffect]: MobEffectPacket, // 28
  [Packet.UpdateAttributes]: UpdateAttributesPacket, // 29
  [Packet.InventoryTransaction]: InventoryTransactionPacket, // 30
  [Packet.MobEquipment]: MobEquipmentPacket, // 31
  [Packet.MobArmorEquipment]: MobArmorEquipmentPacket, // 32
  [Packet.Interact]: InteractPacket, // 33
  [Packet.BlockPickRequest]: BlockPickRequestPacket, // 34
  [Packet.EntityPickRequest]: EntityPickRequestPacket, // 35
  [Packet.PlayerAction]: PlayerActionPacket, // 36
  [Packet.HurtArmor]: HurtArmorPacket, // 38
  [Packet.SetActorData]: SetActorDataPacket, // 39
  [Packet.SetActorMotion]: SetActorMotionPacket, // 40
  [Packet.SetActorLink]: SetActorLinkPacket, // 41
  [Packet.SetHealth]: SetHealthPacket, // 42
  [Packet.SetSpawnPosition]: SetSpawnPositionPacket, // 43
  [Packet.Animate]: AnimatePacket, // 44
  [Packet.Respawn]: RespawnPacket, // 45
  [Packet.ContainerOpen]: ContainerOpenPacket, // 46
  [Packet.ContainerClose]: ContainerClosePacket, // 47
  [Packet.PlayerHotbar]: PlayerHotbarPacket, // 48
  [Packet.InventoryContent]: InventoryContentPacket, // 49
  [Packet.InventorySlot]: InventorySlotPacket, // 50
  [Packet.ContainerSetData]: ContainerSetDataPacket, // 51
  [Packet.CraftingData]: CraftingDataPacket, // 52
  [Packet.GuiDataPickItem]: GuiDataPickItemPacket, // 54
  [Packet.BlockActorData]: BlockActorDataPacket, // 56
  [Packet.LevelChunk]: LevelChunkPacket, // 58
  [Packet.SetCommandsEnabled]: SetCommandsEnabledPacket, // 59
  [Packet.SetDifficulty]: SetDifficultyPacket, // 60
  [Packet.ChangeDimension]: ChangeDimensionPacket, // 61
  [Packet.SetPlayerGameType]: SetPlayerGameTypePacket, // 62
  [Packet.PlayerList]: PlayerListPacket, // 63
  [Packet.SimpleEvent]: SimpleEventPacket, // 64
  [Packet.LegacyTelemetryEvent]: LegacyTelemetryEventPacket, // 65
  [Packet.SpawnExperienceOrb]: SpawnExperienceOrbPacket, // 66
  [Packet.ClientBoundMapItemData]: ClientBoundMapItemDataPacket, // 67
  [Packet.MapInfoRequest]: MapInfoRequestPacket, // 68
  [Packet.RequestChunkRadius]: RequestChunkRadiusPacket, // 69
  [Packet.ChunkRadiusUpdate]: ChunkRadiusUpdatePacket, // 70
  [Packet.GameRulesChanged]: GameRulesChangedPacket, // 72
  [Packet.ShowCredits]: ShowCreditsPacket, // 75
  [Packet.BossEvent]: BossEventPacket, // 74
  [Packet.AvailableCommands]: AvailableCommandsPacket, // 76
  [Packet.CommandRequest]: CommandRequestPacket, // 77
  [Packet.CommandBlockUpdate]: CommandBlockUpdatePacket, // 78
  [Packet.CommandOutput]: CommandOutputPacket, // 79
  [Packet.UpdateTrade]: UpdateTradePacket, // 80
  [Packet.UpdateEquip]: UpdateEquipPacket, // 81
  [Packet.ResourcePackDataInfo]: ResourcePackDataInfoPacket, // 82
  [Packet.ResourcePackChunkData]: ResourcePackChunkDataPacket, // 83
  [Packet.ResourcePackChunkRequest]: ResourcePackChunkRequestPacket, // 84
  [Packet.Transfer]: TransferPacket, // 85
  [Packet.PlaySound]: PlaySoundPacket, // 86
  [Packet.StopSound]: StopSoundPacket, // 87
  [Packet.SetTitle]: SetTitlePacket, // 88
  [Packet.AddBehaviorTree]: AddBehaviorTreePacket, // 89
  [Packet.StructureBlockUpdate]: StructureBlockUpdatePacket, // 90
  [Packet.ShowStoreOffer]: ShowStoreOfferPacket, // 91
  [Packet.PurchaseReceipt]: PurchaseReceiptPacket, // 92
  [Packet.PlayerSkin]: PlayerSkinPacket, // 93
  [Packet.AutomationClientConnect]: AutomationClientConnectPacket, // 95
  [Packet.SetLastHurtBy]: SetLastHurtByPacket, // 96
  [Packet.BookEdit]: BookEditPacket, // 97
  [Packet.NpcRequest]: NpcRequestPacket, // 98
  [Packet.PhotoTransfer]: PhotoTransferPacket, // 99
  [Packet.ModalFormRequest]: ModalFormRequestPacket, // 100
  [Packet.ModalFormResponse]: ModalFormResponsePacket, // 101
  [Packet.ServerSettingsRequest]: ServerSettingsRequestPacket, // 102
  [Packet.ServerSettingsResponse]: ServerSettingsResponsePacket, // 103
  [Packet.ShowProfile]: ShowProfilePacket, // 104
  [Packet.SetDefaultGamemode]: SetDefaultGamemodePacket, // 105
  [Packet.RemoveObjective]: RemoveObjectivePacket, // 106
  [Packet.SetDisplayObjective]: SetDisplayObjectivePacket, // 107
  [Packet.SetScore]: SetScorePacket, // 108
  [Packet.LabTable]: LabTablePacket, // 109
  [Packet.UpdateBlockSync]: UpdateBlockSyncPacket, // 110
  [Packet.MoveActorDelta]: MoveActorDeltaPacket, // 111
  [Packet.SetScoreboardIdentity]: SetScoreboardIdentityPacket, // 112
  [Packet.SetLocalPlayerAsInitialized]: SetLocalPlayerAsInitializedPacket, // 113
  [Packet.UpdateSoftEnum]: UpdateSoftEnumPacket, // 114
  [Packet.NetworkStackLatency]: NetworkStackLatencyPacket, // 115
  [Packet.SpawnParticleEffect]: SpawnParticleEffectPacket, // 118
  [Packet.AvailableActorIdentifiers]: AvailableActorIdentifiersPacket, // 119
  [Packet.NetworkChunkPublisherUpdate]: NetworkChunkPublisherUpdatePacket, // 121
  [Packet.BiomeDefinitionList]: BiomeDefinitionListPacket, // 122
  [Packet.LevelSoundEvent]: LevelSoundEventPacket, // 123
  [Packet.LevelEventGeneric]: LevelEventGenericPacket, // 124
  [Packet.ClientCacheStatus]: ClientCacheStatusPacket, // 129
  [Packet.OnScreenTextureAnimation]: OnScreenTextureAnimationPacket, // 130
  [Packet.Emote]: EmotePacket, // 138
  [Packet.CompletedUsingItem]: CompletedUsingItemPacket, // 142
  [Packet.NetworkSettings]: NetworkSettingsPacket, // 143
  [Packet.PlayerAuthInput]: PlayerAuthInputPacket, // 144
  [Packet.CreativeContent]: CreativeContentPacket, // 145
  [Packet.PlayerEnchantOptions]: PlayerEnchantOptionsPacket, // 146
  [Packet.ItemStackRequest]: ItemStackRequestPacket, // 147
  [Packet.ItemStackResponse]: ItemStackResponsePacket, // 148
  [Packet.UpdatePlayerGameType]: UpdatePlayerGameTypePacket, // 151
  [Packet.EmoteList]: EmoteListPacket, // 152
  [Packet.DebugInfo]: DebugInfoPacket, // 155
  [Packet.PacketViolationWarning]: PacketViolationWarningPacket, // 156
  [Packet.MotionPredictHints]: MotionPredictHintsPacket, // 157
  [Packet.AnimateEntity]: AnimateEntityPacket, // 158
  [Packet.CameraShake]: CameraShakePacket, // 159
  [Packet.PlayerFog]: PlayerFogPacket, // 160
  [Packet.CorrectPlayerMovePrediction]: CorrectPlayerMovePredictionPacket, // 161
  [Packet.ItemRegistry]: ItemRegistryPacket, // 162
  [Packet.ClientBoundDebugRenderer]: ClientBoundDebugRendererPacket, // 163
  [Packet.SyncActorProperty]: SyncActorPropertyPacket, // 165
  [Packet.NpcDialogue]: NpcDialoguePacket, // 169
  [Packet.EduUriResource]: EduUriResourcePacket, // 170
  [Packet.CreatePhoto]: CreatePhotoPacket, // 171
  [Packet.UpdateSubchunkBlocks]: UpdateSubchunkBlocksPacket, // 172
  [Packet.SubChunk]: SubChunkPacket, // 174
  [Packet.SubChunkRequest]: SubChunkRequestPacket, // 175
  [Packet.PlayerStartItemCooldown]: PlayerStartItemCooldownPacket, // 176
  [Packet.ScriptMessage]: ScriptMessagePacket, // 177
  [Packet.CodeBuilderSource]: CodeBuilderSourcePacket, // 178
  [Packet.TickingAreasLoadStatus]: TickingAreasLoadStatusPacket, // 179
  [Packet.DimensionData]: DimensionDataPacket, // 180
  [Packet.AgentActionEvent]: AgentActionEventPacket, // 181
  [Packet.ChangeMobProperty]: ChangeMobPropertyPacket, // 182
  [Packet.LessonProgress]: LessonProgressPacket, // 183
  [Packet.RequestPermissions]: RequestPermissionsPacket, // 185
  [Packet.ToastRequest]: ToastRequestPacket, // 186
  [Packet.UpdateAbilities]: UpdateAbilitiesPacket, // 187
  [Packet.UpdateAdventureSettings]: UpdateAdventureSettingsPacket, // 188
  [Packet.DeathInfo]: DeathInfoPacket, // 189
  [Packet.EditorNetwork]: EditorNetworkPacket, // 190
  [Packet.FeatureRegistry]: FeatureRegistryPacket, // 191
  [Packet.ServerStats]: ServerStatsPacket, // 192
  [Packet.RequestNetworkSettings]: RequestNetworkSettingsPacket, // 193
  [Packet.GameTestRequest]: GameTestRequestPacket, // 194
  [Packet.GameTestResponse]: GameTestResponsePacket, // 195
  [Packet.UpdateClientInputLocks]: UpdateClientInputLocksPacket, // 196
  [Packet.CameraPresetsPacket]: CameraPresetsPacket, // 198
  [Packet.UnlockedRecipes]: UnlockedRecipesPacket, // 199
  [Packet.CameraInstructions]: CameraInstructionsPacket, // 300
  [Packet.TrimData]: TrimDataPacket, // 302
  [Packet.OpenSign]: OpenSignPacket, // 303
  [Packet.SetPlayerInventoryOptions]: SetPlayerInventoryOptionsPacket, // 307
  [Packet.AgentAnimation]: AgentAnimationPacket, // 304
  [Packet.PlayerToggleCrafterRequest]: PlayerToggleCrafterRequestPacket, // 306
  [Packet.SetHud]: SetHudPacket, // 308
  [Packet.AwardAchievement]: AwardAchievementPacket, // 309
  [Packet.ClientboundCloseForm]: ClientboundCloseFormPacket, // 310
  [Packet.ServerboundLoadingScreenPacket]: ServerboundLoadingScreenPacketPacket, // 312
  [Packet.CurrentStructureFeature]: CurrectStructureFeaturePacket, // 314
  [Packet.ServerboundDiagnosticPacket]: ServerboundDiagnosticsPacket, // 315
  [Packet.MovementEffect]: MovementEffectPacket, // 318
  [Packet.PlayerUpdateEntityOverrides]: PlayerUpdateEntityOverridesPacket, // 325
  [Packet.ServerScriptDebugDrawer]: ServerScriptDebugDrawerPacket, // 328
  [Packet.GraphicsOverrideParameter]: GraphicsOverrideParameterPacket // 329
};

export { Packets };
