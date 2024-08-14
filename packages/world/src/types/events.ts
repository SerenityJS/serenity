import type { WorldEvent } from "../enums";
import type {
	BlockUpdateSignal,
	ChunkReadSignal,
	ChunkWriteSignal,
	EntityDespawnedSignal,
	EntityDieSignal,
	EntityEffectAddSignal,
	EntityEffectRemoveSignal,
	EntitySpawnedSignal,
	EntityTeleportSignal,
	FurnaceSmeltSignal,
	PlayerBreakBlockSignal,
	PlayerInteractWithBlockSignal,
	PlayerInteractWithEntitySignal,
	PlayerItemConsumeSignal,
	PlayerMissSwingSignal,
	PlayerPlaceBlockSignal,
	ProjectileHitBlockSignal,
	ProjectileHitEntiySignal
} from "../events";

interface WorldEvents {
	[WorldEvent.EntitySpawned]: [EntitySpawnedSignal];
	[WorldEvent.EntityDespawned]: [EntityDespawnedSignal];
	[WorldEvent.EntityTeleport]: [EntityTeleportSignal];
	[WorldEvent.EntityEffectAdd]: [EntityEffectAddSignal];
	[WorldEvent.EntityEffectRemove]: [EntityEffectRemoveSignal];
	[WorldEvent.PlayerPlaceBlock]: [PlayerPlaceBlockSignal];
	[WorldEvent.PlayerBreakBlock]: [PlayerBreakBlockSignal];
	[WorldEvent.PlayerInteractWithEntity]: [PlayerInteractWithEntitySignal];
	[WorldEvent.PlayerInteractWithBlock]: [PlayerInteractWithBlockSignal];
	[WorldEvent.PlayerItemConsume]: [PlayerItemConsumeSignal];
	[WorldEvent.PlayerMissSwing]: [PlayerMissSwingSignal];
	[WorldEvent.ProjectileHitBlock]: [ProjectileHitBlockSignal];
	[WorldEvent.ProjectileHitEntity]: [ProjectileHitEntiySignal];
	[WorldEvent.BlockUpdate]: [BlockUpdateSignal];
	[WorldEvent.FurnaceSmelt]: [FurnaceSmeltSignal];
	[WorldEvent.ChunkRead]: [ChunkReadSignal];
	[WorldEvent.ChunkWrite]: [ChunkWriteSignal];
	[WorldEvent.EntityDie]: [EntityDieSignal];
}

export { WorldEvents };
