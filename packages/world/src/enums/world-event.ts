enum WorldEvent {
	EntitySpawned,
	EntityDespawned,
	EntityEffectAdd,
	EntityEffectRemove,
	PlayerPlaceBlock,
	PlayerBreakBlock,
	PlayerInteractWithEntity,
	PlayerInteractWithBlock,
	BlockUpdate,
	ChunkRead,
	ChunkWrite
}

export { WorldEvent };
