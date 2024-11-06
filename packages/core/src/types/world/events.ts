import { WorldEvent } from "../../enums";
import {
  ChunkReadySignal,
  EffectAddEventSignal,
  EffectRemoveEventSignal,
  EntityAttributeUpdateSignal,
  EntityDespawnedSignal,
  EntityDimensionChangeSignal,
  EntityFlagUpdateSignal,
  EntityHitEventSignal,
  EntityHurtEventSignal,
  EntityMetadataUpdateSignal,
  EntitySpawnedSignal,
  EntityHealthChangedEventSignal,
  PlayerAbilityUpdateSignal,
  PlayerBreakBlockSignal,
  PlayerChatSignal,
  PlayerDropItemSignal,
  PlayerGamemodeChangeSignal,
  PlayerInteractWithBlockSignal,
  PlayerInteractWithEntitySignal,
  PlayerJoinSignal,
  PlayerLeaveSignal,
  PlayerPlaceBlockSignal,
  PlayerStartEmotingSignal,
  PlayerStartUsingItemSignal,
  PlayerStopEmotingSignal,
  PlayerStopUsingItemSignal,
  PlayerUseItemSignal,
  WorldInitializeSignal,
  WorldTickSignal,
  EntityDieEventSignal
} from "../../events";

interface WorldEventSignals {
  [WorldEvent.WorldInitialize]: [WorldInitializeSignal];
  [WorldEvent.WorldTick]: [WorldTickSignal];
  [WorldEvent.ChunkReady]: [ChunkReadySignal];
  [WorldEvent.EntitySpawned]: [EntitySpawnedSignal];
  [WorldEvent.EntityDespawned]: [EntityDespawnedSignal];
  [WorldEvent.EntityFlagUpdate]: [EntityFlagUpdateSignal];
  [WorldEvent.EntityDimensionChange]: [EntityDimensionChangeSignal];
  [WorldEvent.EntityMetadataUpdate]: [EntityMetadataUpdateSignal];
  [WorldEvent.EntityAttributeUpdate]: [EntityAttributeUpdateSignal];
  [WorldEvent.EntityHit]: [EntityHitEventSignal];
  [WorldEvent.EntityDie]: [EntityDieEventSignal];
  [WorldEvent.EntityHurt]: [EntityHurtEventSignal];
  [WorldEvent.HealthChanged]: [EntityHealthChangedEventSignal];
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
  [WorldEvent.PlayerInteractWithBlock]: [PlayerInteractWithBlockSignal];
  [WorldEvent.PlayerInteractWithEntity]: [PlayerInteractWithEntitySignal];
  [WorldEvent.PlayerStopUsingItem]: [PlayerStopUsingItemSignal];
  [WorldEvent.PlayerUseItem]: [PlayerUseItemSignal];
  [WorldEvent.PlayerStartEmoting]: [PlayerStartEmotingSignal];
  [WorldEvent.PlayerStopEmoting]: [PlayerStopEmotingSignal];
  [WorldEvent.PlayerGamemodeChange]: [PlayerGamemodeChangeSignal];
  [WorldEvent.BlockUpdate]: [];
}

export { WorldEventSignals };
