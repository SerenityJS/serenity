enum WorldEvent {
  WorldInitialize,
  WorldTick,
  ChunkReady,
  EntitySpawned,
  EntityDespawned,
  EffectAdd,
  EffectRemove,
  PlayerJoin,
  PlayerLeave,
  PlayerChat,
  PlayerPlaceBlock,
  PlayerBreakBlock,
  PlayerDropItem,
  PlayerStartUsingItem,
  PlayerStopUsingItem,
  PlayerUseItem,
  PlayerStartEmoting,
  PlayerStopEmoting,
  BlockUpdate
}

export { WorldEvent };
