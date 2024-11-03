enum WorldEvent {
  WorldInitialize,
  WorldTick,
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
  BlockUpdate
}

export { WorldEvent };
