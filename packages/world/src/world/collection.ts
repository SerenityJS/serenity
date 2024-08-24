import Emitter from "@serenityjs/emitter";

import { WorldEnum } from "../commands";

import type { World } from "./world";
import type { WorldEventSignals } from "../types";

/**
 * This class represents a collection of all instantiated worlds.
 * It is used to manage the worlds and emit events to them.
 */
class GlobalWorldCollection extends Emitter<WorldEventSignals> {
	/**
	 * The collection of all instantiated worlds.
	 */
	public readonly entries = new Map<string, World>();

	/**
	 * Gets a world by its identifier.
	 * @param identifier The identifier of the world.
	 * @returns The world that was found.
	 */
	public get(identifier: string): World | undefined {
		return this.entries.get(identifier);
	}

	/**
	 * Adds a world to the collection.
	 * @param world The world to add.
	 */
	public add(world: World): void {
		this.entries.set(world.identifier, world);

		// Add the world identifier to the WorldEnum options.
		WorldEnum.options.push(world.identifier);
	}
}

/**
 * The global collection of all instantiated worlds.
 */
const Worlds = new GlobalWorldCollection();

export { Worlds };
