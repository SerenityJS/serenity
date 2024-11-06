enum WorldEvent {
  WorldInitialize,
  WorldTick,
  ChunkReady,
  EntitySpawned,
  EntityDespawned,
  EntityFlagUpdate,
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
  PlayerStartUsingItem,
  PlayerStopUsingItem,
  PlayerUseItem,
  PlayerStartEmoting,
  PlayerStopEmoting,
  BlockUpdate
}

export { WorldEvent };
