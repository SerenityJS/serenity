import { WorldEventSignal } from "./signal";

import type { World } from "../world";
import type { WorldEvent } from "../enums";

class WorldMessageSignal extends WorldEventSignal {
	public static readonly identifier: WorldEvent.WorldMessage;

	/**
	 * The message to be displayed in the world.
	 */
	public message: string;

	/**
	 * Creates a new world message signal.
	 * @param world The world that the message is being displayed in.
	 * @param message The message to be displayed
	 */
	public constructor(world: World, message: string) {
		super(world);
		this.message = message;
	}
}

export { WorldMessageSignal };
