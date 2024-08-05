import type { WorldEvent } from "../enums";
import type {
	BlockUpdateSignal,
	EntityDespawnedSignal,
	EntitySpawnedSignal,
	PlayerBreakBlockSignal,
	PlayerPlaceBlockSignal
} from "../events";

interface WorldEvents {
	[WorldEvent.EntitySpawned]: [EntitySpawnedSignal];
	[WorldEvent.EntityDespawned]: [EntityDespawnedSignal];
	[WorldEvent.BlockUpdate]: [BlockUpdateSignal];
	[WorldEvent.PlayerPlaceBlock]: [PlayerPlaceBlockSignal];
	[WorldEvent.PlayerBreakBlock]: [PlayerBreakBlockSignal];
}

export { WorldEvents };
