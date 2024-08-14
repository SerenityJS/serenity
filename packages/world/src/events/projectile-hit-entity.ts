import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Entity } from "../entity";
import type { EntityHitResult } from "../types";

class ProjectileHitEntiySignal extends WorldEventSignal {
	public static readonly identifier: WorldEvent =
		WorldEvent.ProjectileHitEntity;

	public projectile: Entity | undefined;
	public hit: EntityHitResult;

	public constructor(hit: EntityHitResult, projectileEntity: Entity) {
		super();
		this.projectile = projectileEntity;
		this.hit = hit;
	}
}

export { ProjectileHitEntiySignal };
