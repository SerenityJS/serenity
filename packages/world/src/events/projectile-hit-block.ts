import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Entity } from "../entity";
import type { BlockHitResult } from "../types";

class ProjectileHitBlockSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.ProjectileHitBlock;

	// The projectile that triggered the event, if applicable.
	public readonly projectile: Entity | undefined;

	// Information about the block that was hit.
	public readonly hit: BlockHitResult;

	/**
	 * Constructs a ProjectileHitBlockSignal instance.
	 *
	 * @param hit - The result of the block hit by the projectile.
	 * @param projectileEntity - The projectile that caused the hit (optional).
	 */
	public constructor(hit: BlockHitResult, projectileEntity?: Entity) {
		super(); // Call the superclass constructor.
		this.hit = hit;
		this.projectile = projectileEntity;

		// TODO: WorldEvents experimental - Remove this once the chosen event system is implemented.
		this.emit();
	}
}

export { ProjectileHitBlockSignal };
