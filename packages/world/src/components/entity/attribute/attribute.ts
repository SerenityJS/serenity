import { EntityComponent } from "../entity-component";

import type { CompoundTag } from "@serenityjs/nbt";
import type { AttributeName } from "@serenityjs/protocol";
import type { Entity } from "../../../entity";

class EntityAttributeComponent extends EntityComponent {
	/**
	 * The identifier of the component.
	 */
	public static readonly identifier: AttributeName;

	/**
	 * The identifier of the component.
	 */
	public readonly identifier: AttributeName;

	/**
	 * The minimum value allowed for the attribute.
	 */
	public effectiveMin: number = 0;

	/**
	 * The maximum value allowed for the attribute.
	 */
	public effectiveMax: number = 0;

	/**
	 * The default value for the attribute.
	 */
	public defaultValue: number = 0;

	/**
	 * Creates a new entity attribute component.
	 *
	 * @param entity The entity the component is binded to.
	 * @param identifier The identifier of the component.
	 * @returns A new entity attribute component.
	 */
	public constructor(entity: Entity, identifier: AttributeName) {
		super(entity, identifier);
		this.identifier = identifier;
	}

	/**
	 * Gets the current value of the attribute.
	 * @returns The current value of the attribute.
	 */
	public getCurrentValue(): number {
		// Check if the entity has the attribute
		const attribute = this.entity.getAttribute(this.identifier);

		// Check if the attribute exists
		if (!attribute)
			throw new Error(
				`The entity "${this.identifier}" attribute was not found.`
			);

		// Return the value of the attribute
		return attribute.current;
	}

	/**
	 * Sets the current value of the attribute.
	 *
	 * @param value The value to set.
	 */
	public setCurrentValue(value: number, sync = true): void {
		// Check if the value is within the min and max range
		if (value < this.effectiveMin) value = this.defaultValue;
		if (value > this.effectiveMax) value = this.defaultValue;

		// Check if the entity has the attribute
		if (this.entity.hasAttribute(this.identifier)) {
			this.entity.setAttribute(this.identifier, value, sync);
		} else {
			this.entity.createAttribute(
				this.identifier,
				value,
				this.defaultValue,
				this.effectiveMax,
				this.effectiveMin,
				sync
			);
		}
	}

	/**
	 * Resets the current value of the attribute to the default value.
	 */
	public resetToDefaultValue(): void {
		// Set the current value to the default value
		this.setCurrentValue(this.defaultValue);
	}

	/**
	 * Resets the current value of the attribute to the maximum value.
	 */
	public resetToMaxValue(): void {
		// Set the current value to the maximum value
		this.setCurrentValue(this.effectiveMax);
	}

	/**
	 * Resets the current value of the attribute.
	 *
	 * @param value The value to decrease.
	 */
	public resetToMinValue(): void {
		// Set the current value to the minimum value
		this.setCurrentValue(this.effectiveMin);
	}

	/**
	 * Decrease the current value of the attribute to the minimum value.
	 * @param value The value to decrease.
	 */
	public decreaseValue(value: number): void {
		// Check if the value is within the min and max range
		if (value > this.getCurrentValue()) value = this.getCurrentValue();

		// Descrease the current value
		this.setCurrentValue(this.getCurrentValue() - value);

		// Set the current value
		this.setCurrentValue(this.getCurrentValue());
	}

	/**
	 * Increase the current value of the attribute to the maximum value.
	 * @param value The value to increase.
	 */
	public increaseValue(value: number): void {
		// Check if the value is within the min and max range
		if (value > this.effectiveMax - this.getCurrentValue())
			value = this.effectiveMax - this.getCurrentValue();

		// Increase the current value
		this.setCurrentValue(this.getCurrentValue() + value);

		// Set the current value
		this.setCurrentValue(this.getCurrentValue());
	}

	public static serialize(
		nbt: CompoundTag,
		component: EntityAttributeComponent
	): void {
		nbt.createFloatTag("Current", component.getCurrentValue());
		nbt.createFloatTag("Default", component.defaultValue);
		nbt.createFloatTag("Max", component.effectiveMax);
		nbt.createFloatTag("Min", component.effectiveMin);
	}

	public static deserialize(
		nbt: CompoundTag,
		entity: Entity
	): EntityAttributeComponent {
		// Get the values from the nbt tag
		const current = nbt.getTag("Current")?.value as number;
		const defaultValue = nbt.getTag("Default")?.value as number;
		const effectiveMax = nbt.getTag("Max")?.value as number;
		const effectiveMin = nbt.getTag("Min")?.value as number;

		// Create a new entity attribute component
		const component = new this(entity, this.identifier);

		// Set the values to the component
		component.setCurrentValue(current, true);
		component.defaultValue = defaultValue;
		component.effectiveMax = effectiveMax;
		component.effectiveMin = effectiveMin;

		// Return the component
		return component;
	}
}

export { EntityAttributeComponent };
