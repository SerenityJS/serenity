import * as Core from "@serenityjs/core";

import { Plugin } from "../plugin";

interface PluginOnEvents {
  onInitialize?: (plugin: Plugin) => void;
  onStartUp?: (plugin: Plugin) => void;
  onShutDown?: (plugin: Plugin) => void;
  onWorldInitialize?: (event: Core.WorldInitializeSignal) => void;
  onWorldTick?: (event: Core.WorldTickSignal) => void;
  onChunkReady?: (event: Core.ChunkReadySignal) => void;
  onEntityHealthChange?: (event: Core.EntityHealthChangedSignal) => void;
  onEntitySpawned?: (event: Core.EntitySpawnedSignal) => void;
  onEntityDespawned?: (event: Core.EntityDespawnedSignal) => void;
  onEntityDie?: (event: Core.EntityDieSignal) => void;
  onEntityFlagUpdate?: (event: Core.EntityFlagUpdateSignal) => void;
  onEntityDimensionChange?: (event: Core.EntityDimensionChangeSignal) => void;
  onEntityMetadataUpdate?: (event: Core.EntityMetadataUpdateSignal) => void;
  onEntityAttributeUpdate?: (event: Core.EntityAttributeUpdateSignal) => void;
  onEntityHit?: (event: Core.EntityHitSignal) => void;
  onEntityHurt?: (event: Core.EntityHurtSignal) => void;
  onEntityEffectAdd?: (event: Core.EffectAddSignal) => void;
  onEntityEffectRemove?: (event: Core.EffectRemoveSignal) => void;
  onPlayerJoin?: (event: Core.PlayerJoinSignal) => void;
  onPlayerLeave?: (event: Core.PlayerLeaveSignal) => void;
  onPlayerChat?: (event: Core.PlayerChatSignal) => void;
  onPlayerPlaceBlock?: (event: Core.PlayerPlaceBlockSignal) => void;
  onPlayerBreakBlock?: (event: Core.PlayerBreakBlockSignal) => void;
  onPlayerDropItem?: (event: Core.PlayerDropItemSignal) => void;
  onPlayerGamemodeChange?: (event: Core.PlayerGamemodeChangeSignal) => void;
  onPlayerAbilityUpdate?: (event: Core.PlayerAbilityUpdateSignal) => void;
  onPlayerStartUsingItem?: (event: Core.PlayerStartUsingItemSignal) => void;
  onPlayerStopUsingItem?: (event: Core.PlayerStopUsingItemSignal) => void;
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
}

export { PluginOnEvents };
