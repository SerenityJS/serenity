// NOTE: Please try to put the packets in the order according to their id. Thx!
// ok 😉 - @bonanoo

import { Packet } from "../../enums";

import { AddEntityPacket } from "./add-entity";
import { AddItemActorPacket } from "./add-item-actor";
import { AddPlayerPacket } from "./add-player";
import { AnimatePacket } from "./animate";
import { AvailableCommandsPacket } from "./available-commands";
import { BiomeDefinitionListPacket } from "./biome-definition-list";
import { BlockPickRequestPacket } from "./block-pick-request";
import { ChangeDimensionPacket } from "./change-dimension";
import { ChunkRadiusUpdatePacket } from "./chunk-radius-update";
import { CommandOutputPacket } from "./command-output";
import { CommandRequestPacket } from "./command-request";
import { ContainerClosePacket } from "./container-close";
import { ContainerOpenPacket } from "./container-open";
import { CreativeContentPacket } from "./creative-content";
import { DisconnectPacket } from "./disconnect";
import { InteractPacket } from "./interact";
import { InventoryContentPacket } from "./inventory-content";
import { InventorySlotPacket } from "./inventory-slot";
import { InventoryTransactionPacket } from "./inventory-transaction";
import { ItemComponentPacket } from "./item-component";
import { ItemStackRequestPacket } from "./item-stack-request";
import { ItemStackResponsePacket } from "./item-stack-response";
import { LevelChunkPacket } from "./level-chunk";
import { LevelEventPacket } from "./level-event";
import { LevelSoundEventPacket } from "./level-sound-event";
import { LoginPacket } from "./login";
import { MobEquipmentPacket } from "./mob-equipment";
import { ModalFormRequestPacket } from "./modal-form-request";
import { ModalFormResponsePacket } from "./modal-form-response";
import { MoveActorAbsolutePacket } from "./move-actor-absolute";
import { MovePlayerPacket } from "./move-player";
import { NetworkChunkPublisherUpdatePacket } from "./network-chunk-publisher-update";
import { NetworkSettingsPacket } from "./network-settings";
import { PacketViolationWarningPacket } from "./packet-violation-warning";
import { PlayStatusPacket } from "./play-status";
import { PlayerActionPacket } from "./player-action";
import { PlayerAuthInputPacket } from "./player-auth-input";
import { PlayerHotbarPacket } from "./player-hotbar";
import { PlayerListPacket } from "./player-list";
import { RemoveEntityPacket } from "./remove-entity";
import { RequestChunkRadiusPacket } from "./request-chunk-radius";
import { RequestNetworkSettingsPacket } from "./request-network-settings";
import { ResourcePackClientResponsePacket } from "./resource-pack-client-response";
import { ResourcePackDataInfoPacket } from "./resource-pack-data-info";
import { ResourcePackChunkDataPacket } from "./resource-pack-chunk-data";
import { ResourcePackChunkRequestPacket } from "./resource-pack-chunk-request";
import { ResourcePackStackPacket } from "./resource-pack-stack";
import { ResourcePacksInfoPacket } from "./resource-packs-info";
import { RespawnPacket } from "./respawn";
import { ScriptMessagePacket } from "./script-message";
import { SetActorMotionPacket } from "./set-actor-motion";
import { SetCommandsEnabledPacket } from "./set-commands-enabled";
import { SetActorDataPacket } from "./set-actor-data";
import { SetLocalPlayerAsInitializedPacket } from "./set-local-player-as-initialized";
import { SetPlayerGameTypePacket } from "./set-player-game-type";
import { SetTitlePacket } from "./set-title";
import { StartGamePacket } from "./start-game";
import { TextPacket } from "./text";
import { ToastRequestPacket } from "./toast-request";
import { UpdateAbilitiesPacket } from "./update-abilities";
import { UpdateAdventureSettingsPacket } from "./update-adventure-settings";
import { UpdateAttributesPacket } from "./update-attributes";
import { UpdateBlockPacket } from "./update-block";
import { SetTimePacket } from "./set-time";
import { RemoveObjectivePacket } from "./remove-objective";
import { SetDisplayObjectivePacket } from "./set-display-objective";
import { SetScorePacket } from "./set-score";
import { SetScoreboardIdentityPacket } from "./set-scoreboard-identity";
import { TransferPacket } from "./transfer";
import { SetHudPacket } from "./set-hud";
import { TakeItemActorPacket } from "./take-item-actor";
import { NetworkStackLatencyPacket } from "./network-stack-latency";
import { BossEventPacket } from "./boss-event";
import { NpcDialoguePacket } from "./npc-dialogue";
import { ActorEventPacket } from "./actor-event";
import { AnimateEntityPacket } from "./animate-entity";
import { EmoteListPacket } from "./emote-list";
import { EmotePacket } from "./emote";
import { PlayerSkinPacket } from "./player-skin";
import { BlockActorDataPacket } from "./block-actor-data";
import { AwardAchievementPacket } from "./award-achievement";
import { ServerToClientHandshakePacket } from "./server-to-client-handshake";
import { DeathInfoPacket } from "./death-info";
import { SetPlayerInventoryOptionsPacket } from "./set-player-inventory-options";
import { ClientboundCloseFormPacket } from "./clientbound-close-form";
import { MobEffectPacket } from "./mob-effect";
import { CompletedUsingItemPacket } from "./completed-using-item";
import { NpcRequestPacket } from "./npc-request";
import { OpenSignPacket } from "./open-sign";
import { ServerboundLoadingScreenPacketPacket } from "./server-bound-loading-screen";
import { CameraShakePacket } from "./camera-shake";
import { BookEditPacket } from "./book-edit";
import { PlayerStartItemCooldownPacket } from "./player-start-item-cooldown";
import { CameraPresetsPacket } from "./camera-presets";
import { CameraInstructionsPacket } from "./camera-instructions";
import { CraftingDataPacket } from "./crafting-data";
import { SpawnParticleEffectPacket } from "./spawn-particle-effect";
import { ContainerSetDataPacket } from "./container-set-data";
import { AvailableActorIdentifiersPacket } from "./available-actor-identifiers";
import { StructureBlockUpdatePacket } from "./structure-block-update";
import { DimensionDataPacket } from "./dimension-data";
import { PlayerEnchantOptionsPacket } from "./player-enchant-options";
import { ClientToServerHandshakePacket } from "./client-to-server-handshake";
import { MobArmorEquipmentPacket } from "./mob-armor-equipment";
import { RiderJumpPacket } from "./rider-jump";
import { BlockEventPacket } from "./block-event";
import { EntityPickRequestPacket } from "./entity-pick-request";
import { HurtArmorPacket } from "./hurt-armor";
import { ShowCreditsPacket } from "./show-credits";
import { UpdateClientInputLocksPacket } from "./update-client-input-locks";
import { OnScreenTextureAnimationPacket } from "./on-screen-texture-animation";
import { ServerboundDiagnosticsPacket } from "./serverbound-diagnostics";
import { PlaySoundPacket } from "./play-sound";
import { SetActorLinkPacket } from "./set-actor-link";
import { StopSoundPacket } from "./stop-sound";
import { MoveActorDeltaPacket } from "./move-actor-delta";
import { PlayerFogPacket } from "./player-fog";
import { CurrectStructureFeaturePacket } from "./current-structure-feature";
import { GameRulesChangedPacket } from "./game-rules-changed";
import { LegacyTelemetryEventPacket } from "./legacy-telemetry-event";
import { LevelEventGenericPacket } from "./level-event-generic";
import { SetDifficultyPacket } from "./set-difficulty";
import { SetSpawnPositionPacket } from "./set-spawn-position";
import { SetHealthPacket } from "./set-health";
import { SyncActorPropertyPacket } from "./sync-actor-property";
import { TrimDataPacket } from "./trim-data";
import { UnlockedRecipesPacket } from "./unlocked-recipes";
import { RequestPermissionsPacket } from "./request-permissions";
import { ServerSettingsResponsePacket } from "./server-settings-response";
import { CommandBlockUpdatePacket } from "./command-block-update";
import { ShowProfilePacket } from "./show-profile";
import { DebugInfoPacket } from "./debug-info";
import { ClientBoundDebugRendererPacket } from "./client-bound-debug-renderer";
import { CorrectPlayerMovePredictionPacket } from "./correct-player-move-prediction";
import { MovementEffectPacket } from "./movement-effect";
import { ClientBoundMapItemDataPacket } from "./client-bound-map-item-data";
import { MapInfoRequestPacket } from "./map-info-request";
import { UpdateTradePacket } from "./update-trade";

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
  [Packet.LevelEvent]: LevelEventPacket, // 25
  [Packet.BlockEvent]: BlockEventPacket, // 26
  [Packet.ActorEvent]: ActorEventPacket, // 27
  [Packet.MobEffect]: MobEffectPacket,
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
  [Packet.BlockActorData]: BlockActorDataPacket, // 56
  [Packet.LevelChunk]: LevelChunkPacket, // 58
  [Packet.SetCommandsEnabled]: SetCommandsEnabledPacket, // 59
  [Packet.SetDifficulty]: SetDifficultyPacket, // 60
  [Packet.ChangeDimension]: ChangeDimensionPacket, // 61
  [Packet.SetPlayerGameType]: SetPlayerGameTypePacket, // 62
  [Packet.PlayerList]: PlayerListPacket, // 63
  [Packet.LegacyTelemetryEvent]: LegacyTelemetryEventPacket, // 65
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
  [Packet.ResourcePackDataInfo]: ResourcePackDataInfoPacket, // 82
  [Packet.ResourcePackChunkData]: ResourcePackChunkDataPacket, // 83
  [Packet.ResourcePackChunkRequest]: ResourcePackChunkRequestPacket, // 84
  [Packet.Transfer]: TransferPacket, // 85
  [Packet.PlaySound]: PlaySoundPacket, // 86
  [Packet.StopSound]: StopSoundPacket, // 87
  [Packet.SetTitle]: SetTitlePacket, // 88
  [Packet.StructureBlockUpdate]: StructureBlockUpdatePacket, // 90
  [Packet.PlayerSkin]: PlayerSkinPacket, // 93
  [Packet.BookEdit]: BookEditPacket, // 97
  [Packet.NpcRequest]: NpcRequestPacket, // 98
  [Packet.ModalFormRequest]: ModalFormRequestPacket, // 100
  [Packet.ModalFormResponse]: ModalFormResponsePacket, // 101
  [Packet.ServerSettingsResponse]: ServerSettingsResponsePacket, // 103
  [Packet.ShowProfile]: ShowProfilePacket, // 104
  [Packet.RemoveObjective]: RemoveObjectivePacket, // 106
  [Packet.SetDisplayObjective]: SetDisplayObjectivePacket, // 107
  [Packet.SetScore]: SetScorePacket, // 108
  [Packet.MoveActorDelta]: MoveActorDeltaPacket, // 111
  [Packet.SetScoreboardIdentity]: SetScoreboardIdentityPacket, // 112
  [Packet.SetLocalPlayerAsInitialized]: SetLocalPlayerAsInitializedPacket, // 113
  [Packet.NetworkStackLatency]: NetworkStackLatencyPacket, // 115
  [Packet.SpawnParticleEffect]: SpawnParticleEffectPacket, // 118
  [Packet.AvailableActorIdentifiers]: AvailableActorIdentifiersPacket, // 119
  [Packet.NetworkChunkPublisherUpdate]: NetworkChunkPublisherUpdatePacket, // 121
  [Packet.BiomeDefinitionList]: BiomeDefinitionListPacket, // 122
  [Packet.LevelSoundEvent]: LevelSoundEventPacket, // 123
  [Packet.LevelEventGeneric]: LevelEventGenericPacket, // 124
  [Packet.OnScreenTextureAnimation]: OnScreenTextureAnimationPacket, // 130
  [Packet.Emote]: EmotePacket, // 138
  [Packet.CompletedUsingItem]: CompletedUsingItemPacket, // 142
  [Packet.NetworkSettings]: NetworkSettingsPacket, // 143
  [Packet.PlayerAuthInput]: PlayerAuthInputPacket, // 144
  [Packet.CreativeContent]: CreativeContentPacket, // 145
  [Packet.PlayerEnchantOptions]: PlayerEnchantOptionsPacket, // 146
  [Packet.ItemStackRequest]: ItemStackRequestPacket, // 147
  [Packet.ItemStackResponse]: ItemStackResponsePacket, // 148
  [Packet.EmoteList]: EmoteListPacket, // 152
  [Packet.DebugInfo]: DebugInfoPacket, // 155
  [Packet.PacketViolationWarning]: PacketViolationWarningPacket, // 156
  [Packet.AnimateEntity]: AnimateEntityPacket, // 158
  [Packet.CameraShake]: CameraShakePacket, // 159
  [Packet.PlayerFog]: PlayerFogPacket, // 160
  [Packet.CorrectPlayerMovePrediction]: CorrectPlayerMovePredictionPacket, // 161
  [Packet.ItemComponent]: ItemComponentPacket, // 162
  [Packet.ClientBoundDebugRenderer]: ClientBoundDebugRendererPacket, // 163
  [Packet.SyncActorProperty]: SyncActorPropertyPacket, // 165
  [Packet.NpcDialogue]: NpcDialoguePacket, // 169
  [Packet.PlayerStartItemCooldown]: PlayerStartItemCooldownPacket, // 176
  [Packet.ScriptMessage]: ScriptMessagePacket, // 177
  [Packet.DimensionData]: DimensionDataPacket, // 180
  [Packet.RequestPermissions]: RequestPermissionsPacket, // 185
  [Packet.ToastRequest]: ToastRequestPacket, // 186
  [Packet.UpdateAbilities]: UpdateAbilitiesPacket, // 187
  [Packet.UpdateAdventureSettings]: UpdateAdventureSettingsPacket, // 188
  [Packet.DeathInfo]: DeathInfoPacket, // 189
  [Packet.RequestNetworkSettings]: RequestNetworkSettingsPacket, // 193
  [Packet.UpdateClientInputLocks]: UpdateClientInputLocksPacket, // 196
  [Packet.CameraPresetsPacket]: CameraPresetsPacket, // 198
  [Packet.UnlockedRecipes]: UnlockedRecipesPacket, // 199
  [Packet.CameraInstructions]: CameraInstructionsPacket, // 300
  [Packet.TrimData]: TrimDataPacket, // 302
  [Packet.OpenSign]: OpenSignPacket, // 303
  [Packet.SetPlayerInventoryOptions]: SetPlayerInventoryOptionsPacket, // 307
  [Packet.SetHud]: SetHudPacket, // 308
  [Packet.AwardAchievement]: AwardAchievementPacket, // 309
  [Packet.ClientboundCloseForm]: ClientboundCloseFormPacket, // 310
  [Packet.ServerboundLoadingScreenPacket]: ServerboundLoadingScreenPacketPacket, // 312
  [Packet.CurrentStructureFeature]: CurrectStructureFeaturePacket, // 314
  [Packet.ServerboundDiagnosticPacket]: ServerboundDiagnosticsPacket, // 315
  [Packet.MovementEffect]: MovementEffectPacket // 318
};

export { Packets };
