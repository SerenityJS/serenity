import { EntityComponent } from "./entity-component";

import type { EntityHitResult, HitResult } from "../../types";
import type { Vector3f } from "@serenityjs/protocol";
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

	// The damage dealt by the projectile upon hitting something.
	public hurtDamage: number = 0;

	/**
	 * Constructs an EntityProjectileComponent for a given entity.
	 *
	 * @param entity - The entity to which this component belongs.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityProjectileComponent.identifier);
	}

	/**
	 * Called when the projectile hits something.
	 * TODO: This should spawn particles when the projectile hits something
	 * @param hit - The hit result containing the entity that was hit.
	 */
	public onHit(hit: HitResult): void {
		if ("entity" in hit) {
			if (this.hurtDamage == 0) return;
			const entity = (hit as EntityHitResult).entity;
			entity.applyDamage(this.hurtDamage);
		}
		if (this.destroyOnHit) {
			setTimeout(() => {
				this.entity.despawn();
			}, 20);
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
