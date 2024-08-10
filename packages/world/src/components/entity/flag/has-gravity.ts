import { ActorFlag } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityFlagComponent } from "./flag";

import type { Entity } from "../../../entity";

class EntityHasGravityComponent extends EntityFlagComponent {
	public static readonly identifier = "minecraft:has_gravity";

	public static readonly types = [EntityIdentifier.Player];

	public readonly flag = ActorFlag.HasGravity;

	public defaultValue = true;

	/**
	 * Creates a new entity has gravity component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity has gravity component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityHasGravityComponent.identifier);

		// Check if the entity contains the gravity flag
		this.setCurrentValue(this.defaultValue, false);
	}

	/**
	 * Gets the current value of the entity has gravity component.
	 * @returns The current value of the entity has gravity component.
	 */
	public getCurrentValue(): boolean {
		return super.getCurrentValue() as boolean;
	}

	/**
	 * Sets the current value of the entity has gravity component.
	 *
	 * @param value The new value of the entity has gravity component.
	 * @param sync Whether to synchronize the entity has gravity component.
	 */
	public setCurrentValue(value: boolean, sync?: boolean): void {
		super.setCurrentValue(value, sync);
	}
}

export { EntityHasGravityComponent };
