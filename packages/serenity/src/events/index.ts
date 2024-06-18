// Abstract signals
export * from "./event-signal";

// Concrete player signals
export * from "./player-joined";
export * from "./player-spawned";
export * from "./player-chat";
export * from "./player-place-block";
export * from "./player-break-block";
export * from "./player-container-open";
export * from "./player-dropped-item";

// Concrete entity signals
export * from "./entity-spawned";

// Import signals
import { PlayerJoinedSignal } from "./player-joined";
import { PlayerSpawnedSignal } from "./player-spawned";
import { PlayerChatSignal } from "./player-chat";
import { PlayerPlaceBlockSignal } from "./player-place-block";
import { PlayerStartedBreakingBlockSignal } from "./player-started-breaking-block";
import { PlayerBreakBlockSignal } from "./player-break-block";
import { PlayerContainerOpenSignal } from "./player-container-open";
import { PlayerDroppedItemSignal } from "./player-dropped-item";
import { EntitySpawnedSignal } from "./entity-spawned";

/**
 * Contains all the event signals.
 */
const EVENT_SIGNALS = [
	PlayerJoinedSignal,
	PlayerSpawnedSignal,
	PlayerChatSignal,
	PlayerPlaceBlockSignal,
	PlayerStartedBreakingBlockSignal,
	PlayerBreakBlockSignal,
	PlayerContainerOpenSignal,
	PlayerDroppedItemSignal,
	EntitySpawnedSignal
];

// Exports
export { EVENT_SIGNALS };
export * from "./priority";
export * from "./signals";
