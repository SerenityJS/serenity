// Abstract signals
export * from "./event-signal";

// Concrete signals
export * from "./player-joined";
export * from "./player-spawned";

// Import signals
import { PlayerJoinedSignal } from "./player-joined";
import { PlayerSpawnedSignal } from "./player-spawned";

/**
 * Contains all the event signals.
 */
const EVENT_SIGNALS = [PlayerJoinedSignal, PlayerSpawnedSignal];

// Exports
export { EVENT_SIGNALS };
export * from "./priority";
export * from "./signals";
