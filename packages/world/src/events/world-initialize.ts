import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { World } from "../world";

class WorldInitializeSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.WorldInitialize;

	/**
	 * The world that has been initialized.
	 */
	public readonly world: World;

	/**
	 * Creates a new world initialize signal.
	 * @param world The world that has been initialized.
	 */
	public constructor(world: World) {
		super();
		this.world = world;
	}

	public getWorld(): World {
		return this.world;
	}
}

export { WorldInitializeSignal };
