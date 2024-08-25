import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { World } from "../world";

class WorldTickSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.WorldTick;

	/**
	 * The current tick of the world.
	 */
	public readonly currentTick: bigint;

	/**
	 * The time delta between the current tick and the last tick.
	 */
	public readonly deltaTick: bigint;

	/**
	 * The world that has been ticked.
	 */
	public readonly world: World;

	/**
	 * Creates a new world tick signal.
	 * @param currentTick The current tick of the world.
	 * @param deltaTick The time delta between the current tick and the last tick.
	 * @param world The world that has been ticked.
	 */
	public constructor(currentTick: bigint, deltaTick: bigint, world: World) {
		super(world);
		this.currentTick = currentTick;
		this.deltaTick = deltaTick;
		this.world = world;
	}
}

export { WorldTickSignal };
