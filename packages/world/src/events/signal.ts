import { WorldEvents } from "./world-events";

import type { WorldEvent } from "../enums";

class WorldEventSignal {
	public static readonly identifier: WorldEvent;

	/**
	 * The identifier of the signal.
	 */
	public readonly identifier = (this.constructor as typeof WorldEventSignal)
		.identifier;

	/**
	 * Emits the signal to the WorldEvents instance.
	 * @returns Returns true if the signal was processed, false if it was cancelled.
	 */
	public emit(): boolean {
		// Return the emitted signal
		return WorldEvents.emit(this.identifier, this as never);
	}
}

export { WorldEventSignal };
