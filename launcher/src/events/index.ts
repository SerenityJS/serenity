// Abstract signals
export * from "./event-signal";

// Concrete signals
export * from "./player-joined";

// Import signals
import { PlayerJoinedSignal } from "./player-joined";

/**
 * Contains all the event signals.
 */
const EVENT_SIGNALS = [PlayerJoinedSignal];

// Exports
export { EVENT_SIGNALS };
export * from "./signals";
