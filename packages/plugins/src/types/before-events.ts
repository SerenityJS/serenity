import * as Core from "@serenityjs/core";

interface PluginBeforeEvents {
  beforeWorldInitialize?: (event: Core.WorldInitializeSignal) => boolean;
  beforeWorldTick?: (event: Core.WorldTickSignal) => boolean;
  beforeChunkReady?: (event: Core.ChunkReadySignal) => boolean;
  beforeEntityHealthChange?: (event: Core.EntityHealthChangedSignal) => boolean;
  beforeEntitySpawned?: (event: Core.EntitySpawnedSignal) => boolean;
  beforeEntityDespawned?: (event: Core.EntityDespawnedSignal) => boolean;
  beforeEntityDie?: (event: Core.EntityDieSignal) => boolean;
  beforeEntityFlagUpdate?: (event: Core.EntityFlagUpdateSignal) => boolean;
  beforeEntityDimensionChange: (
    event: Core.EntityDimensionChangeSignal
  ) => boolean;
  beforeEntityMetadataUpdate: (
    event: Core.EntityMetadataUpdateSignal
  ) => boolean;
  beforeEntityAttributeUpdate: (
    event: Core.EntityAttributeUpdateSignal
  ) => boolean;
  beforeEntityHit?: (event: Core.EntityHitSignal) => boolean;
  beforeEntityHurt?: (event: Core.EntityHurtSignal) => boolean;
  beforeEntityEffectAdd?: (event: Core.EffectAddSignal) => boolean;
  beforeEntityEffectRemove?: (event: Core.EffectRemoveSignal) => boolean;
  beforePlayerJoin?: (event: Core.PlayerJoinSignal) => boolean;
  beforePlayerLeave?: (event: Core.PlayerLeaveSignal) => boolean;
  beforePlayerChat?: (event: Core.PlayerChatSignal) => boolean;
  beforePlayerPlaceBlock?: (event: Core.PlayerPlaceBlockSignal) => boolean;
  beforePlayerBreakBlock?: (event: Core.PlayerBreakBlockSignal) => boolean;
  beforePlayerDropItem?: (event: Core.PlayerDropItemSignal) => boolean;
  beforePlayerGamemodeChange?: (
    event: Core.PlayerGamemodeChangeSignal
  ) => boolean;
  beforePlayerAbilityUpdate?: (
    event: Core.PlayerAbilityUpdateSignal
  ) => boolean;
  beforePlayerStartUsingItem?: (
    event: Core.PlayerStartUsingItemSignal
  ) => boolean;
  beforePlayerStopUsingItem?: (
    event: Core.PlayerStopUsingItemSignal
  ) => boolean;
  beforePlayerStartEmoting?: (event: Core.PlayerStartEmotingSignal) => boolean;
  beforePlayerStopEmoting?: (event: Core.PlayerStopEmotingSignal) => boolean;
  beforePlayerInteractWithBlock?: (
    event: Core.PlayerInteractWithBlockSignal
  ) => boolean;
  beforePlayerInteractWithEntity?: (
    event: Core.PlayerInteractWithEntitySignal
  ) => boolean;
  beforePlayerOpenedContainer?: (
    event: Core.PlayerOpenedContainerSignal
  ) => boolean;
  beforePlayerClosedContainer?: (
    event: Core.PlayerClosedContainerSignal
  ) => boolean;
  beforePlayerContainerInteraction?: (
    event: Core.PlayerContainerInteractionSignal
  ) => boolean;
}

export { PluginBeforeEvents };
