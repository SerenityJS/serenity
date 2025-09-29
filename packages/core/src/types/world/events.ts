import { WorldEvent } from "../../enums";

import type {
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
  EntityDropItemSignal,
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
  EntityDiedSignal,
  PlayerOpenedContainerSignal,
  PlayerContainerInteractionSignal,
  PlayerClosedContainerSignal,
  PlayerInitializedSignal,
  PlayerUseItemOnBlockSignal,
  PlayerUseItemOnEntitySignal,
  BlockPermutationUpdateSignal,
  ItemStackDamagedSignal,
  PlayerDropExperienceSignal
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
  [WorldEvent.EntityDied]: [EntityDiedSignal];
  [WorldEvent.EntityHurt]: [EntityHurtSignal];
  [WorldEvent.EntityDropItem]: [EntityDropItemSignal];
  [WorldEvent.HealthChanged]: [EntityHealthChangedSignal];
  [WorldEvent.EffectAdd]: [EffectAddSignal];
  [WorldEvent.EffectRemove]: [EffectRemoveSignal];
  [WorldEvent.PlayerInitialized]: [PlayerInitializedSignal];
  [WorldEvent.PlayerJoin]: [PlayerJoinSignal];
  [WorldEvent.PlayerLeave]: [PlayerLeaveSignal];
  [WorldEvent.PlayerChat]: [PlayerChatSignal];
  [WorldEvent.PlayerPlaceBlock]: [PlayerPlaceBlockSignal];
  [WorldEvent.PlayerBreakBlock]: [PlayerBreakBlockSignal];
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
  [WorldEvent.PlayerDropExperience]: [PlayerDropExperienceSignal];
  [WorldEvent.BlockUpdate]: [];
  [WorldEvent.BlockPermutationUpdate]: [BlockPermutationUpdateSignal];
  [WorldEvent.ItemStackDamaged]: [ItemStackDamagedSignal];
}

export { WorldEventSignals };
