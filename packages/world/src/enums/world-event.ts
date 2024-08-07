enum WorldEvent {
	EntitySpawned,
	EntityDespawned,
	EntityEffectAdd,
	EntityEffectRemove,
	EntityDie,
	EntityTeleport,
	PlayerPlaceBlock,
	PlayerBreakBlock,
	PlayerInteractWithEntity,
	PlayerInteractWithBlock,
	PlayerItemConsume,
	PlayerMissSwing,
	BlockUpdate,
	FurnaceSmelt,
	ChunkRead,
	ChunkWrite
}

export { WorldEvent };
