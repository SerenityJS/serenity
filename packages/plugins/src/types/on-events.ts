import * as Core from "@serenityjs/core";

import { Plugin } from "../plugin";

interface PluginOnEvents {
  onInitialize?: (plugin: Plugin) => void;
  onStartUp?: (plugin: Plugin) => Promise<void>;
  onShutDown?: (plugin: Plugin) => Promise<void>;
  onWorldInitialize?: (event: Core.WorldInitializeSignal) => void;
  onWorldTick?: (event: Core.WorldTickSignal) => void;
  onChunkReady?: (event: Core.ChunkReadySignal) => void;
  onHealthChanged?: (event: Core.EntityHealthChangedSignal) => void;
  onEntitySpawned?: (event: Core.EntitySpawnedSignal) => void;
  onEntityDespawned?: (event: Core.EntityDespawnedSignal) => void;
  onEntityDied?: (event: Core.EntityDiedSignal) => void;
  onEntityFlagUpdate?: (event: Core.EntityFlagUpdateSignal) => void;
  onEntityDimensionChange?: (event: Core.EntityDimensionChangeSignal) => void;
  onEntityMetadataUpdate?: (event: Core.EntityMetadataUpdateSignal) => void;
  onEntityAttributeUpdate?: (event: Core.EntityAttributeUpdateSignal) => void;
  onEntityHit?: (event: Core.EntityHitSignal) => void;
  onEntityHurt?: (event: Core.EntityHurtSignal) => void;
  onEntityDropItem?: (event: Core.EntityDropItemSignal) => void;
  onEntityItemPickup?: (event: Core.EntityItemPickupSignal) => void;
  onEffectAdd?: (event: Core.EffectAddSignal) => void;
  onEffectRemove?: (event: Core.EffectRemoveSignal) => void;
  onPlayerInitialized?: (event: Core.PlayerInitializedSignal) => void;
  onPlayerJoin?: (event: Core.PlayerJoinSignal) => void;
  onPlayerLeave?: (event: Core.PlayerLeaveSignal) => void;
  onPlayerChat?: (event: Core.PlayerChatSignal) => void;
  onPlayerPlaceBlock?: (event: Core.PlayerPlaceBlockSignal) => void;
  onPlayerBreakBlock?: (event: Core.PlayerBreakBlockSignal) => void;
  onPlayerGamemodeChange?: (event: Core.PlayerGamemodeChangeSignal) => void;
  onPlayerAbilityUpdate?: (event: Core.PlayerAbilityUpdateSignal) => void;
  onPlayerStartUsingItem?: (event: Core.PlayerStartUsingItemSignal) => void;
  onPlayerStopUsingItem?: (event: Core.PlayerStopUsingItemSignal) => void;
  onPlayerUseItem?: (event: Core.PlayerUseItemSignal) => void;
  onPlayerUseItemOnBlock?: (event: Core.PlayerUseItemOnBlockSignal) => void;
  onPlayerUseItemOnEntity?: (event: Core.PlayerUseItemOnEntitySignal) => void;
  onPlayerStartEmoting?: (event: Core.PlayerStartEmotingSignal) => void;
  onPlayerStopEmoting?: (event: Core.PlayerStopEmotingSignal) => void;
  onPlayerInteractWithBlock?: (
    event: Core.PlayerInteractWithBlockSignal
  ) => void;
  onPlayerInteractWithEntity?: (
    event: Core.PlayerInteractWithEntitySignal
  ) => void;
  onPlayerOpenedContainer?: (event: Core.PlayerOpenedContainerSignal) => void;
  onPlayerClosedContainer?: (event: Core.PlayerClosedContainerSignal) => void;
  onPlayerContainerInteraction?: (
    event: Core.PlayerContainerInteractionSignal
  ) => void;
  onPlayerDropExperience?: (event: Core.PlayerDropExperienceSignal) => void;
  onPlayerEditSign?: (event: Core.PlayerEditSignSignal) => void;
  onPlayerCraftRecipe?: (event: Core.PlayerCraftRecipeSignal) => void;
  onBlockUpdate?: (event: Core.BlockUpdateSignal) => void;
  onBlockPermutationUpdate?: (event: Core.BlockPermutationUpdateSignal) => void;
  onItemStackDamaged?: (event: Core.ItemStackDamagedSignal) => void;
}

export { PluginOnEvents };
