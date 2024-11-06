import { WorldEvent } from "../../enums";
import {
  ChunkReadySignal,
  EffectAddEventSignal,
  EffectRemoveEventSignal,
  EntityAttributeUpdateSignal,
  EntityDespawnedSignal,
  EntityFlagUpdateSignal,
  EntityMetadataUpdateSignal,
  EntitySpawnedSignal,
  PlayerAbilityUpdateSignal,
  PlayerBreakBlockSignal,
  PlayerChatSignal,
  PlayerDropItemSignal,
  PlayerGamemodeChangeSignal,
  PlayerJoinSignal,
  PlayerLeaveSignal,
  PlayerPlaceBlockSignal,
  PlayerStartEmotingSignal,
  PlayerStartUsingItemSignal,
  PlayerStopEmotingSignal,
  PlayerStopUsingItemSignal,
  PlayerUseItemSignal,
  WorldInitializeSignal,
  WorldTickSignal
} from "../../events";
import { PlayerDimensionChangeSignal } from "../../events/player-dimension-change";

interface WorldEventSignals {
  [WorldEvent.WorldInitialize]: [WorldInitializeSignal];
  [WorldEvent.WorldTick]: [WorldTickSignal];
  [WorldEvent.ChunkReady]: [ChunkReadySignal];
  [WorldEvent.EntitySpawned]: [EntitySpawnedSignal];
  [WorldEvent.EntityDespawned]: [EntityDespawnedSignal];
  [WorldEvent.EntityFlagUpdate]: [EntityFlagUpdateSignal];
  [WorldEvent.EntityMetadataUpdate]: [EntityMetadataUpdateSignal];
  [WorldEvent.EntityAttributeUpdate]: [EntityAttributeUpdateSignal];
  [WorldEvent.EffectAdd]: [EffectAddEventSignal];
  [WorldEvent.EffectRemove]: [EffectRemoveEventSignal];
  [WorldEvent.PlayerJoin]: [PlayerJoinSignal];
  [WorldEvent.PlayerLeave]: [PlayerLeaveSignal];
  [WorldEvent.PlayerChat]: [PlayerChatSignal];
  [WorldEvent.PlayerPlaceBlock]: [PlayerPlaceBlockSignal];
  [WorldEvent.PlayerBreakBlock]: [PlayerBreakBlockSignal];
  [WorldEvent.PlayerDropItem]: [PlayerDropItemSignal];
  [WorldEvent.PlayerAbilityUpdate]: [PlayerAbilityUpdateSignal];
  [WorldEvent.PlayerStartUsingItem]: [PlayerStartUsingItemSignal];
  [WorldEvent.PlayerStopUsingItem]: [PlayerStopUsingItemSignal];
  [WorldEvent.PlayerUseItem]: [PlayerUseItemSignal];
  [WorldEvent.PlayerStartEmoting]: [PlayerStartEmotingSignal];
  [WorldEvent.PlayerStopEmoting]: [PlayerStopEmotingSignal];
  [WorldEvent.PlayerGamemodeChange]: [PlayerGamemodeChangeSignal];
  [WorldEvent.PlayerDimensionChange]: [PlayerDimensionChangeSignal];
  [WorldEvent.BlockUpdate]: [];
}

export { WorldEventSignals };
