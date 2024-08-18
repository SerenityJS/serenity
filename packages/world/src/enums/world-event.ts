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
	PlayerOpenDoor,
	BlockUpdate,
	FurnaceSmelt,
	ProjectileHitBlock,
	ProjectileHitEntity,
	ChunkRead,
	ChunkWrite
}

export { WorldEvent };
