import {
	ProjectileHitBlockSignal,
	ProjectileHitEntiySignal
} from "../../events";

import { EntityComponent } from "./entity-component";

import type { Vector3f } from "@serenityjs/protocol";
import type { BlockHitResult, EntityHitResult, HitResult } from "../../types";
import type { Entity } from "../../entity";

class EntityProjectileComponent extends EntityComponent {
	public static identifier: string = "minecraft:projectile";

	// Optional reference to the entity that shooted this projectile.
	public owner?: Entity;

	// Optional particle effect to display when the projectile hits something.
	public hitParticle?: string;

	// Whether the projectile should cause a lightning strike upon hitting something.
	public lightningStrikeOnHit: boolean = false;

	// Whether the projectile should be destroyed upon hitting something.
	public destroyOnHit: boolean = true;

	// Whether the projectile should stop moving upon hitting something.
	public stopOnHit: boolean = true;

	/**
	 * Constructs an EntityProjectileComponent for a given entity.
	 *
	 * @param entity - The entity to which this component belongs.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityProjectileComponent.identifier);
	}

	public onHit(hit: HitResult): void {
		if (this.destroyOnHit) {
			setTimeout(() => {
				this.entity.despawn();
			}, 20);
		}

		if ("blockPosition" in hit) {
			// Handle block hit case.
			const signal = new ProjectileHitBlockSignal(
				hit as BlockHitResult,
				this.entity
			);
			this.entity.getWorld().emit(signal.identifier, signal);

			return;
		}

		if ("entity" in hit) {
			// Handle entity hit case.
			const signal = new ProjectileHitEntiySignal(
				hit as EntityHitResult,
				this.entity
			);

			this.entity.getWorld().emit(signal.identifier, signal);
		}
	}

	/**
	 * Sets the projectile's velocity and starts its movement.
	 *
	 * @param velocity - The velocity to apply to the projectile.
	 */
	public shoot(velocity: Vector3f): void {
		this.entity.setMotion(velocity);
	}
}

export { EntityProjectileComponent };
