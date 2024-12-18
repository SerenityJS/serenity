import * as Core from "@serenityjs/core";

interface PluginAfterEvents {
  afterWorldInitialize?: (event: Core.WorldInitializeSignal) => void;
  afterWorldTick?: (event: Core.WorldTickSignal) => void;
  afterChunkReady?: (event: Core.ChunkReadySignal) => void;
  afterEntityHealthChange?: (event: Core.EntityHealthChangedSignal) => void;
  afterEntitySpawned?: (event: Core.EntitySpawnedSignal) => void;
  afterEntityDespawned?: (event: Core.EntityDespawnedSignal) => void;
  afterEntityDie?: (event: Core.EntityDieSignal) => void;
  afterEntityFlagUpdate?: (event: Core.EntityFlagUpdateSignal) => void;
  afterEntityDimensionChange?: (
    event: Core.EntityDimensionChangeSignal
  ) => void;
  afterEntityMetadataUpdate?: (event: Core.EntityMetadataUpdateSignal) => void;
  afterEntityAttributeUpdate?: (
    event: Core.EntityAttributeUpdateSignal
  ) => void;
  afterEntityHit?: (event: Core.EntityHitSignal) => void;
  afterEntityHurt?: (event: Core.EntityHurtSignal) => void;
  afterEntityEffectAdd?: (event: Core.EffectAddSignal) => void;
  afterEntityEffectRemove?: (event: Core.EffectRemoveSignal) => void;
  afterPlayerJoin?: (event: Core.PlayerJoinSignal) => void;
  afterPlayerLeave?: (event: Core.PlayerLeaveSignal) => void;
  afterPlayerChat?: (event: Core.PlayerChatSignal) => void;
  afterPlayerPlaceBlock?: (event: Core.PlayerPlaceBlockSignal) => void;
  afterPlayerBreakBlock?: (event: Core.PlayerBreakBlockSignal) => void;
  afterPlayerDropItem?: (event: Core.PlayerDropItemSignal) => void;
  afterPlayerGamemodeChange?: (event: Core.PlayerGamemodeChangeSignal) => void;
  afterPlayerAbilityUpdate?: (event: Core.PlayerAbilityUpdateSignal) => void;
  afterPlayerStartUsingItem?: (event: Core.PlayerStartUsingItemSignal) => void;
  afterPlayerStopUsingItem?: (event: Core.PlayerStopUsingItemSignal) => void;
  afterPlayerStartEmoting?: (event: Core.PlayerStartEmotingSignal) => void;
  afterPlayerStopEmoting?: (event: Core.PlayerStopEmotingSignal) => void;
  afterPlayerInteractWithBlock?: (
    event: Core.PlayerInteractWithBlockSignal
  ) => void;
  afterPlayerInteractWithEntity?: (
    event: Core.PlayerInteractWithEntitySignal
  ) => void;
  afterPlayerOpenedContainer?: (
    event: Core.PlayerOpenedContainerSignal
  ) => void;
  afterPlayerClosedContainer?: (
    event: Core.PlayerClosedContainerSignal
  ) => void;
  afterPlayerContainerInteraction?: (
    event: Core.PlayerContainerInteractionSignal
  ) => void;
}

export { PluginAfterEvents };
