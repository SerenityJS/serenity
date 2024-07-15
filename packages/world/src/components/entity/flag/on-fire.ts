import { ActorFlag } from "@serenityjs/protocol";

import { EntityFlagComponent } from "./flag";

import type { Entity } from "../../../entity";

class EntityOnFireComponent extends EntityFlagComponent {
	public static readonly identifier = "minecraft:on_fire";

	public readonly flag = ActorFlag.OnFire;

	public defaultValue = false;

	public onFireRemainingTicks = 300;

	/**
	 * Creates a new entity breathing component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity breathing component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityOnFireComponent.identifier);

		// Set the entity to have breathing
		this.setCurrentValue(this.defaultValue, false);
	}

	/**
	 * Extinquishes the fire on the entity.
	 */
	public extinguish(): void {
		// Set the remaining ticks to 0
		this.onFireRemainingTicks = 0;
	}

	public onTick(): void {
		// Check if the value is true
		if (this.getCurrentValue()) {
			// Decrease the remaining ticks
			this.onFireRemainingTicks--;

			// Check if the remaining ticks is less than or equal to
			if (this.onFireRemainingTicks <= 0) {
				// Set the value to false
				this.setCurrentValue(false);

				// Remove the component from the entity
				this.entity.removeComponent(EntityOnFireComponent.identifier);
			} else if (
				this.entity.dimension.world.currentTick % 20n === 0n &&
				this.entity.hasComponent("minecraft:health")
			) {
				// Apply damage to the entity
				this.entity.applyDamage(1);
			}
		}
	}
}

export { EntityOnFireComponent };
