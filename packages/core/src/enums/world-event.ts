enum WorldEvent {
  WorldInitialize,
  WorldTick,
  ChunkReady,
  EntitySpawned,
  EntityDespawned,
  EntityFlagUpdate,
  EntityDimensionChange,
  EffectAdd,
  EffectRemove,
  PlayerJoin,
  PlayerLeave,
  PlayerChat,
  PlayerPlaceBlock,
  PlayerBreakBlock,
  PlayerDropItem,
  PlayerGamemodeChange,
  PlayerStartUsingItem,
  PlayerStopUsingItem,
  PlayerUseItem,
  PlayerStartEmoting,
  PlayerStopEmoting,
  PlayerInteractWithBlock,
  BlockUpdate
}

export { WorldEvent };
