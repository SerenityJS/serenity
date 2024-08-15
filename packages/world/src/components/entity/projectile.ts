import { Raycaster } from "../../collisions";
import {
	ProjectileHitBlockSignal,
	ProjectileHitEntiySignal
} from "../../events";

import { EntityComponent } from "./entity-component";

import type { Vector3f } from "@serenityjs/protocol";
import type { BlockHitResult, EntityHitResult } from "../../types";
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

	/**
	 * Called every tick to check for collisions and handle projectile behavior.
	 */
	public onTick(): void {
		// Check for collision with blocks or entities along the projectile's path.
		const hit = Raycaster.clip(
			this.entity.dimension,
			this.entity.position,
			this.entity.position.add(this.entity.velocity),
			this.entity.getComponent("minecraft:collision_box")?.collisionBox,
			(entity) => entity.unique == this.entity.unique || !entity.isAlive
		);

		if (!hit) return; // Exit if no collision is detected.
		// Destroy the projectile after a short delay if configured.
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
