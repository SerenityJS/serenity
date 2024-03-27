import { UpdateAttributesPacket, type Attribute } from "@serenityjs/protocol";

import { EntityComponent } from "../entity-component";

import type { Entity } from "../../../entity";

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

		// Create a new UpdateAttributesPacket
		const packet = new UpdateAttributesPacket();

		// Set the packet properties
		packet.runtimeEntityId = this.entity.runtime;
		packet.attributes = this.entity.getAttributes().map((component) => {
			return {
				name: component.identifier,
				min: component.effectiveMin,
				max: component.effectiveMax,
				current: component.currentValue,
				default: component.defaultValue,
				modifiers: []
			};
		});
		packet.tick = this.entity.dimension.world.currentTick;

		// Broadcast the packet to the dimension
		this.entity.dimension.broadcast(packet);
	}

	/**
	 * Resets the current value of the attribute to the default value.
	 */
	public resetToDefaultValue(): void {
		// Set the value
		this.currentValue = this.defaultValue;

		// Set the current value to the default value
		this.setCurrentValue(this.defaultValue);
	}

	/**
	 * Resets the current value of the attribute to the maximum value.
	 */
	public resetToMaxValue(): void {
		// Set the value
		this.currentValue = this.effectiveMax;

		// Set the current value to the maximum value
		this.setCurrentValue(this.effectiveMax);
	}

	/**
	 * Resets the current value of the attribute to the minimum value.
	 */
	public resetToMinValue(): void {
		// Set the value
		this.currentValue = this.effectiveMin;

		// Set the current value to the minimum value
		this.setCurrentValue(this.effectiveMin);
	}
}

export { EntityAttributeComponent };
