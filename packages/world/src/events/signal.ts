import type { World } from "../world";
import type { WorldEvent } from "../enums";

class WorldEventSignal {
	public static readonly identifier: WorldEvent;

	/**
	 * The world instance the signal was emitted in.
	 */
	public readonly world: World;

	/**
	 * Creates a new signal instance.
	 * @param world The world instance the signal was emitted in.
	 * @returns A new signal instance.
	 */
	public constructor(world: World) {
		this.world = world;
	}

	/**
	 * Emits the signal.
	 * @returns True if the signal was emitted, false otherwise.
	 */
	public emit(): boolean {
		return this.world.emitter.emit(this.identifier, this);
	}

	/**
	 * The identifier of the signal.
	 */
	public readonly identifier = (this.constructor as typeof WorldEventSignal)
		.identifier;
}

export { WorldEventSignal };
