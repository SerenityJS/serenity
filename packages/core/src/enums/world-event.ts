enum WorldEvent {
  WorldInitialize,
  WorldTick,
  EntitySpawned,
  EntityDespawned,
  PlayerJoin,
  PlayerLeave,
  PlayerChat,
  PlayerPlaceBlock,
  PlayerBreakBlock,
  PlayerDropItem,
  PlayerStartUsingItem,
  PlayerStopUsingItem,
  PlayerUseItem,
  BlockUpdate
}

export { WorldEvent };
