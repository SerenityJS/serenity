import { Emitter } from "@serenityjs/emitter";

import type { WorldEventSignals as Events } from "../types";

/**
 * The class that emits all world events.
 * You should use the `WorldEvents` instance to listen to events.
 */
class WorldEventSignals extends Emitter<Events> {}

/**
 * A static instance of the all world event signals.
 */
const WorldEvents = new WorldEventSignals();

export { WorldEvents };
