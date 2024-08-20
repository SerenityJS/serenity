enum WorldEvent {
	EntitySpawned,
	EntityDespawned,
	EntityEffectAdd,
	EntityEffectRemove,
	EntityDie,
	EntityTeleport,
	PlayerJoin,
	PlayerLeave,
	PlayerChat,
	PlayerPlaceBlock,
	PlayerBreakBlock,
	PlayerInteractWithEntity,
	PlayerInteractWithBlock,
	PlayerItemConsume,
	PlayerMissSwing,
	PlayerOpenDoor,
	PlayerJump,
	BlockUpdate,
	FurnaceSmelt,
	ProjectileHitBlock,
	ProjectileHitEntity,
	ChunkRead,
	ChunkWrite
}

export { WorldEvent };
