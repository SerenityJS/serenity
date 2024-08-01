import type { WorldEvent } from "../enums";
import type { EntitySpawnedSignal } from "../events";

interface WorldEvents {
	[WorldEvent.EntitySpawned]: [EntitySpawnedSignal];
}

export { WorldEvents };
