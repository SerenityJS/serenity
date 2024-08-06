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
	BlockUpdate,
	FurnaceSmelt,
	ChunkRead,
	ChunkWrite
}

export { WorldEvent };
