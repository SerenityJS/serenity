import type { WorldEvent } from "../enums";

class WorldEventSignal {
	public static readonly identifier: WorldEvent;

	public readonly identifier = (this.constructor as typeof WorldEventSignal)
		.identifier;
}

export { WorldEventSignal };
