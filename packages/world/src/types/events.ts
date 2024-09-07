import type { PlayerLeaveSignal } from "../events/player-leave";
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
	PlayerButtonPushSignal,
	PlayerChatSignal,
	PlayerExecuteCommandSignal,
	PlayerInitializeSignal,
	PlayerInteractWithBlockSignal,
	PlayerInteractWithEntitySignal,
	PlayerItemConsumeSignal,
	PlayerJoinSignal,
	PlayerJumpSignal,
	PlayerMissSwingSignal,
	PlayerOpenDoorSignal,
	PlayerPlaceBlockSignal,
	PlayerStartSwimmingSignal,
	PlayerStopSwimmingSignal,
	WorldInitializeSignal,
	WorldMessageSignal,
	WorldTickSignal
} from "../events";

interface WorldEventSignals {
	[WorldEvent.WorldInitialize]: [WorldInitializeSignal];
	[WorldEvent.WorldTick]: [WorldTickSignal];
	[WorldEvent.WorldMessage]: [WorldMessageSignal];
	[WorldEvent.EntitySpawned]: [EntitySpawnedSignal];
	[WorldEvent.EntityDespawned]: [EntityDespawnedSignal];
	[WorldEvent.EntityTeleport]: [EntityTeleportSignal];
	[WorldEvent.EntityEffectAdd]: [EntityEffectAddSignal];
	[WorldEvent.EntityEffectRemove]: [EntityEffectRemoveSignal];
	[WorldEvent.PlayerJoin]: [PlayerJoinSignal];
	[WorldEvent.PlayerLeave]: [PlayerLeaveSignal];
	[WorldEvent.PlayerInitialize]: [PlayerInitializeSignal];
	[WorldEvent.PlayerChat]: [PlayerChatSignal];
	[WorldEvent.PlayerExecuteCommand]: [PlayerExecuteCommandSignal];
	[WorldEvent.PlayerPlaceBlock]: [PlayerPlaceBlockSignal];
	[WorldEvent.PlayerBreakBlock]: [PlayerBreakBlockSignal];
	[WorldEvent.PlayerInteractWithEntity]: [PlayerInteractWithEntitySignal];
	[WorldEvent.PlayerInteractWithBlock]: [PlayerInteractWithBlockSignal];
	[WorldEvent.PlayerButtonPush]: [PlayerButtonPushSignal];
	[WorldEvent.PlayerItemConsume]: [PlayerItemConsumeSignal];
	[WorldEvent.PlayerMissSwing]: [PlayerMissSwingSignal];
	[WorldEvent.PlayerOpenDoor]: [PlayerOpenDoorSignal];
	[WorldEvent.PlayerJump]: [PlayerJumpSignal];
	[WorldEvent.PlayerStartSwimming]: [PlayerStartSwimmingSignal];
	[WorldEvent.PlayerStopSwimming]: [PlayerStopSwimmingSignal];
	[WorldEvent.BlockUpdate]: [BlockUpdateSignal];
	[WorldEvent.FurnaceSmelt]: [FurnaceSmeltSignal];
	[WorldEvent.ChunkRead]: [ChunkReadSignal];
	[WorldEvent.ChunkWrite]: [ChunkWriteSignal];
	[WorldEvent.EntityDie]: [EntityDieSignal];
}

export { WorldEventSignals };
