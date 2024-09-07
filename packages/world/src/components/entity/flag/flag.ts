import { EntityComponent } from "../entity-component";

import type { Entity } from "../../../entity";
import type { CompoundTag } from "@serenityjs/nbt";
import type { ActorFlag } from "@serenityjs/protocol";

class EntityFlagComponent extends EntityComponent {
	/**
	 * The flag of the flag component.
	 */
	public flag!: ActorFlag;

	/**
	 * The default value for the flag component.
	 */
	public defaultValue!: boolean;

	/**
	 * Gets the current value of the flag component.
	 * @returns The current value of the flag component.
	 */
	public getCurrentValue(): boolean {
		// Check if the entity has the data flag
		const flag = this.entity.flags.get(this.flag);

		// Check if the data was not found
		if (flag === undefined)
			// Throw an error as this should never happen if the component was set up correctly
			throw new Error(`The entity does not have the ${this.flag} flag.`);

		// Return the value of the data
		return this.entity.flags.get(this.flag) as boolean;
	}

	/**
	 * Sets the current value of the flag component.
	 * @param value The value to set.
	 */
	public setCurrentValue(value: boolean, sync = true): void {
		// Set the value of the flag
		this.entity.flags.set(this.flag, value);

		// Check if the data should be synced
		if (sync) this.entity.updateActorData();
	}

	/**
	 * Resets the flag component to the default value.
	 */
	public resetToDefaultValue(): void {
		this.setCurrentValue(this.defaultValue);
	}

	public static serialize(
		nbt: CompoundTag,
		component: EntityFlagComponent
	): void {
		nbt.createByteTag("flag", component.flag);
		nbt.createByteTag("value", component.getCurrentValue() ? 1 : 0);
		nbt.createByteTag("default", component.defaultValue ? 1 : 0);
	}

	public static deserialize(
		nbt: CompoundTag,
		entity: Entity
	): EntityFlagComponent {
		// Create a new entity flag component.
		const component = new this(entity, this.identifier);

		// Get the flag from the nbt.
		component.flag = nbt.getTag("flag")?.value as ActorFlag;

		// Get the value from the nbt.
		const value = nbt.getTag("value")?.value as number;

		// Get the default value from the nbt.
		const defaultValue = nbt.getTag("default")?.value as number;

		// Set the current value of the flag.
		component.setCurrentValue(value === 1);

		// Set the default value of the flag.
		component.defaultValue = defaultValue === 1;

		// Return the entity flag component.
		return component;
	}
}

export { EntityFlagComponent };
