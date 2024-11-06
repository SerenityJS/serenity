enum WorldEvent {
  WorldInitialize,
  WorldTick,
  ChunkReady,
  EntitySpawned,
  EntityDespawned,
  EntityFlagUpdate,
  EntityMetadataUpdate,
  EntityAttributeUpdate,
  EffectAdd,
  EffectRemove,
  PlayerJoin,
  PlayerLeave,
  PlayerChat,
  PlayerPlaceBlock,
  PlayerBreakBlock,
  PlayerDimensionChange,
  PlayerDropItem,
  PlayerGamemodeChange,
  PlayerAbilityUpdate,
  PlayerStartUsingItem,
  PlayerStopUsingItem,
  PlayerUseItem,
  PlayerStartEmoting,
  PlayerStopEmoting,
  BlockUpdate
}

export { WorldEvent };
