import { Worlds } from "../world";

import type { World } from "../world";
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
		return Worlds.emit(this.identifier, this as never);
	}

	/**
	 * Gets the world instance the signal was emitted in.
	 * @returns The world instance.
	 */
	public getWorld(): World {
		throw new Error("Method not implemented.");
	}
}

export { WorldEventSignal };
