import * as Core from "@serenityjs/core";

interface PluginAfterEvents {
  afterWorldInitialize?: (
    event: Core.WorldInitializeSignal,
    canceled: boolean
  ) => void;
  afterWorldTick?: (event: Core.WorldTickSignal, canceled: boolean) => void;
  afterChunkReady?: (event: Core.ChunkReadySignal, canceled: boolean) => void;
  afterHealthChanged?: (
    event: Core.EntityHealthChangedSignal,
    canceled: boolean
  ) => void;
  afterEntitySpawned?: (
    event: Core.EntitySpawnedSignal,
    canceled: boolean
  ) => void;
  afterEntityDespawned?: (
    event: Core.EntityDespawnedSignal,
    canceled: boolean
  ) => void;
  afterEntityDied?: (event: Core.EntityDiedSignal, canceled: boolean) => void;
  afterEntityFlagUpdate?: (
    event: Core.EntityFlagUpdateSignal,
    canceled: boolean
  ) => void;
  afterEntityDimensionChange?: (
    event: Core.EntityDimensionChangeSignal,
    canceled: boolean
  ) => void;
  afterEntityMetadataUpdate?: (
    event: Core.EntityMetadataUpdateSignal,
    canceled: boolean
  ) => void;
  afterEntityAttributeUpdate?: (
    event: Core.EntityAttributeUpdateSignal,
    canceled: boolean
  ) => void;
  afterEntityHit?: (event: Core.EntityHitSignal, canceled: boolean) => void;
  afterEntityHurt?: (event: Core.EntityHurtSignal, canceled: boolean) => void;
  afterEntityDropItem?: (
    event: Core.EntityDropItemSignal,
    canceled: boolean
  ) => void;
  afterEntityItemPickup?: (
    event: Core.EntityItemPickupSignal,
    canceled: boolean
  ) => void;
  afterEffectAdd?: (event: Core.EffectAddSignal, canceled: boolean) => void;
  afterEffectRemove?: (
    event: Core.EffectRemoveSignal,
    canceled: boolean
  ) => void;
  afterPlayerInitialized?: (
    event: Core.PlayerInitializedSignal,
    canceled: boolean
  ) => void;
  afterPlayerJoin?: (event: Core.PlayerJoinSignal, canceled: boolean) => void;
  afterPlayerLeave?: (event: Core.PlayerLeaveSignal, canceled: boolean) => void;
  afterPlayerChat?: (event: Core.PlayerChatSignal, canceled: boolean) => void;
  afterPlayerPlaceBlock?: (
    event: Core.PlayerPlaceBlockSignal,
    canceled: boolean
  ) => void;
  afterPlayerBreakBlock?: (
    event: Core.PlayerBreakBlockSignal,
    canceled: boolean
  ) => void;
  afterPlayerGamemodeChange?: (
    event: Core.PlayerGamemodeChangeSignal,
    canceled: boolean
  ) => void;
  afterPlayerAbilityUpdate?: (
    event: Core.PlayerAbilityUpdateSignal,
    canceled: boolean
  ) => void;
  afterPlayerStartUsingItem?: (
    event: Core.PlayerStartUsingItemSignal,
    canceled: boolean
  ) => void;
  afterPlayerStopUsingItem?: (
    event: Core.PlayerStopUsingItemSignal,
    canceled: boolean
  ) => void;
  afterPlayerUseItem?: (
    event: Core.PlayerUseItemSignal,
    canceled: boolean
  ) => void;
  afterPlayerUseItemOnBlock?: (
    event: Core.PlayerUseItemOnBlockSignal,
    canceled: boolean
  ) => void;
  afterPlayerUseItemOnEntity?: (
    event: Core.PlayerUseItemOnEntitySignal,
    canceled: boolean
  ) => void;
  afterPlayerStartEmoting?: (
    event: Core.PlayerStartEmotingSignal,
    canceled: boolean
  ) => void;
  afterPlayerStopEmoting?: (
    event: Core.PlayerStopEmotingSignal,
    canceled: boolean
  ) => void;
  afterPlayerInteractWithBlock?: (
    event: Core.PlayerInteractWithBlockSignal,
    canceled: boolean
  ) => void;
  afterPlayerInteractWithEntity?: (
    event: Core.PlayerInteractWithEntitySignal,
    canceled: boolean
  ) => void;
  afterPlayerOpenedContainer?: (
    event: Core.PlayerOpenedContainerSignal,
    canceled: boolean
  ) => void;
  afterPlayerClosedContainer?: (
    event: Core.PlayerClosedContainerSignal,
    canceled: boolean
  ) => void;
  afterPlayerContainerInteraction?: (
    event: Core.PlayerContainerInteractionSignal,
    canceled: boolean
  ) => void;
  afterPlayerDropExperience?: (
    event: Core.PlayerDropExperienceSignal,
    canceled: boolean
  ) => void;
  afterPlayerEditSign?: (
    event: Core.PlayerEditSignSignal,
    canceled: boolean
  ) => void;
  afterPlayerCraftRecipe?: (
    event: Core.PlayerCraftRecipeSignal,
    canceled: boolean
  ) => void;
  afterBlockUpdate?: (event: Core.BlockUpdateSignal, canceled: boolean) => void;
  afterBlockPermutationUpdate?: (
    event: Core.BlockPermutationUpdateSignal,
    canceled: boolean
  ) => void;
  afterItemStackDamaged?: (
    event: Core.ItemStackDamagedSignal,
    canceled: boolean
  ) => void;
}

export { PluginAfterEvents };
