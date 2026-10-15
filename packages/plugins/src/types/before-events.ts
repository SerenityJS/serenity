import * as Core from "@serenityjs/core";

interface PluginBeforeEvents {
  beforeWorldInitialize?: (event: Core.WorldInitializeSignal) => boolean;
  beforeWorldTick?: (event: Core.WorldTickSignal) => boolean;
  beforeChunkReady?: (event: Core.ChunkReadySignal) => boolean;
  beforeHealthChanged?: (event: Core.EntityHealthChangedSignal) => boolean;
  beforeEntitySpawned?: (event: Core.EntitySpawnedSignal) => boolean;
  beforeEntityDespawned?: (event: Core.EntityDespawnedSignal) => boolean;
  beforeEntityDied?: (event: Core.EntityDiedSignal) => boolean;
  beforeEntityFlagUpdate?: (event: Core.EntityFlagUpdateSignal) => boolean;
  beforeEntityDimensionChange?: (
    event: Core.EntityDimensionChangeSignal
  ) => boolean;
  beforeEntityMetadataUpdate?: (
    event: Core.EntityMetadataUpdateSignal
  ) => boolean;
  beforeEntityAttributeUpdate?: (
    event: Core.EntityAttributeUpdateSignal
  ) => boolean;
  beforeEntityHit?: (event: Core.EntityHitSignal) => boolean;
  beforeEntityHurt?: (event: Core.EntityHurtSignal) => boolean;
  beforeEntityDropItem?: (event: Core.EntityDropItemSignal) => boolean;
  beforeEntityItemPickup?: (event: Core.EntityItemPickupSignal) => boolean;
  beforeEffectAdd?: (event: Core.EffectAddSignal) => boolean;
  beforeEffectRemove?: (event: Core.EffectRemoveSignal) => boolean;
  beforePlayerInitialized?: (event: Core.PlayerInitializedSignal) => boolean;
  beforePlayerJoin?: (event: Core.PlayerJoinSignal) => boolean;
  beforePlayerLeave?: (event: Core.PlayerLeaveSignal) => boolean;
  beforePlayerChat?: (event: Core.PlayerChatSignal) => boolean;
  beforePlayerPlaceBlock?: (event: Core.PlayerPlaceBlockSignal) => boolean;
  beforePlayerBreakBlock?: (event: Core.PlayerBreakBlockSignal) => boolean;
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
  beforePlayerUseItem?: (event: Core.PlayerUseItemSignal) => boolean;
  beforePlayerUseItemOnBlock?: (
    event: Core.PlayerUseItemOnBlockSignal
  ) => boolean;
  beforePlayerUseItemOnEntity?: (
    event: Core.PlayerUseItemOnEntitySignal
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
  beforePlayerDropExperience?: (
    event: Core.PlayerDropExperienceSignal
  ) => boolean;
  beforePlayerEditSign?: (event: Core.PlayerEditSignSignal) => boolean;
  beforePlayerCraftRecipe?: (event: Core.PlayerCraftRecipeSignal) => boolean;
  beforeBlockUpdate?: (event: Core.BlockUpdateSignal) => boolean;
  beforeBlockPermutationUpdate?: (
    event: Core.BlockPermutationUpdateSignal
  ) => boolean;
  beforeItemStackDamaged?: (event: Core.ItemStackDamagedSignal) => boolean;
}

export { PluginBeforeEvents };
