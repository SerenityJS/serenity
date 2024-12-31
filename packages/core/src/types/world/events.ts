import { WorldEvent } from "../../enums";
import {
  ChunkReadySignal,
  EffectAddSignal,
  EffectRemoveSignal,
  EntityAttributeUpdateSignal,
  EntityDespawnedSignal,
  EntityDimensionChangeSignal,
  EntityFlagUpdateSignal,
  EntityHitSignal,
  EntityHurtSignal,
  EntityMetadataUpdateSignal,
  EntitySpawnedSignal,
  EntityHealthChangedSignal,
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
  EntityDieSignal,
  PlayerOpenedContainerSignal,
  PlayerContainerInteractionSignal,
  PlayerClosedContainerSignal,
  PlayerInitializedSignal,
  PlayerUseItemOnBlockSignal,
  PlayerUseItemOnEntitySignal,
  BlockPermutationUpdateSignal
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
  [WorldEvent.EntityHit]: [EntityHitSignal];
  [WorldEvent.EntityDie]: [EntityDieSignal];
  [WorldEvent.EntityHurt]: [EntityHurtSignal];
  [WorldEvent.HealthChanged]: [EntityHealthChangedSignal];
  [WorldEvent.EffectAdd]: [EffectAddSignal];
  [WorldEvent.EffectRemove]: [EffectRemoveSignal];
  [WorldEvent.PlayerInitialized]: [PlayerInitializedSignal];
  [WorldEvent.PlayerJoin]: [PlayerJoinSignal];
  [WorldEvent.PlayerLeave]: [PlayerLeaveSignal];
  [WorldEvent.PlayerChat]: [PlayerChatSignal];
  [WorldEvent.PlayerPlaceBlock]: [PlayerPlaceBlockSignal];
  [WorldEvent.PlayerBreakBlock]: [PlayerBreakBlockSignal];
  [WorldEvent.PlayerDropItem]: [PlayerDropItemSignal];
  [WorldEvent.PlayerGamemodeChange]: [PlayerGamemodeChangeSignal];
  [WorldEvent.PlayerAbilityUpdate]: [PlayerAbilityUpdateSignal];
  [WorldEvent.PlayerStartUsingItem]: [PlayerStartUsingItemSignal];
  [WorldEvent.PlayerStopUsingItem]: [PlayerStopUsingItemSignal];
  [WorldEvent.PlayerUseItem]: [PlayerUseItemSignal];
  [WorldEvent.PlayerUseItemOnBlock]: [PlayerUseItemOnBlockSignal];
  [WorldEvent.PlayerUseItemOnEntity]: [PlayerUseItemOnEntitySignal];
  [WorldEvent.PlayerStartEmoting]: [PlayerStartEmotingSignal];
  [WorldEvent.PlayerStopEmoting]: [PlayerStopEmotingSignal];
  [WorldEvent.PlayerInteractWithBlock]: [PlayerInteractWithBlockSignal];
  [WorldEvent.PlayerInteractWithEntity]: [PlayerInteractWithEntitySignal];
  [WorldEvent.PlayerOpenedContainer]: [PlayerOpenedContainerSignal];
  [WorldEvent.PlayerClosedContainer]: [PlayerClosedContainerSignal];
  [WorldEvent.PlayerContainerInteraction]: [PlayerContainerInteractionSignal];
  [WorldEvent.BlockUpdate]: [];
  [WorldEvent.BlockPermutationUpdate]: [BlockPermutationUpdateSignal];
}

export { WorldEventSignals };
