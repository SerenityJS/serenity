import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { World } from "../world";

class WorldInitializeSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.WorldInitialize;

	/**
	 * Creates a new world initialize signal.
	 * @param world The world that has been initialized.
	 */
	public constructor(world: World) {
		super(world);
	}
}

export { WorldInitializeSignal };
