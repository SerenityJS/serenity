import { Player } from "../../../player/player";
import { EntityComponent } from "../component";

import type { Attribute } from "@serenityjs/protocol";
import type { Entity } from "../..";

abstract class EntityAttributeComponent extends EntityComponent {
	/**
	 * The identifier of the component.
	 */
	public abstract readonly identifier: Attribute;

	/**
	 * The minimum value allowed for the attribute.
	 */
	public abstract readonly effectiveMin: number;

	/**
	 * The maximum value allowed for the attribute.
	 */
	public abstract readonly effectiveMax: number;

	/**
	 * The default value for the attribute.
	 */
	public abstract readonly defaultValue: number;

	/**
	 * The current value of the attribute.
	 */
	public abstract currentValue: number;

	/**
	 * The constructor of the entity attribute component.
	 *
	 * @param entity The entity to construct the component for.
	 */
	public constructor(entity: Entity) {
		super(entity);

		// Set the default value
		this.resetToDefaultValue();
	}

	/**
	 * Sets the current value of the attribute.
	 *
	 * @param value The value to set.
	 */
	public setCurrentValue(value: number): void {
		// Check if the value is within the min and max range
		if (value < this.effectiveMin) value = this.defaultValue;
		if (value > this.effectiveMax) value = this.defaultValue;

		// Set the value
		this.currentValue = value;

		// Check if the entity is a player
		if (this.entity instanceof Player) {
			// Update the attributes of the player
			this.entity.dimension.world.updateAttributes(this.entity);
		} else {
			throw new TypeError(
				"Component 'EntityMovementComponent' is not implemented for non-player entities."
			);
		}
	}

	/**
	 * Resets the current value of the attribute to the default value.
	 */
	public resetToDefaultValue(): void {
		// Set the value
		this.currentValue = this.defaultValue;

		// Check if the entity is a player
		if (this.entity instanceof Player) {
			// Update the attributes of the player
			this.entity.dimension.world.updateAttributes(this.entity);
		}
	}

	/**
	 * Resets the current value of the attribute to the maximum value.
	 */
	public resetToMaxValue(): void {
		// Set the value
		this.currentValue = this.effectiveMax;

		// Check if the entity is a player
		if (this.entity instanceof Player) {
			// Update the attributes of the player
			this.entity.dimension.world.updateAttributes(this.entity);
		}
	}

	/**
	 * Resets the current value of the attribute to the minimum value.
	 */
	public resetToMinValue(): void {
		// Set the value
		this.currentValue = this.effectiveMin;

		// Check if the entity is a player
		if (this.entity instanceof Player) {
			// Update the attributes of the player
			this.entity.dimension.world.updateAttributes(this.entity);
		} else {
			throw new TypeError(
				"Component 'EntityMovementComponent' is not implemented for non-player entities."
			);
		}
	}
}

export { EntityAttributeComponent };
