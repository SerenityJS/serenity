import { EntityComponent } from "../entity-component";

import type { ActorFlag } from "@serenityjs/protocol";

abstract class EntityFlagComponent extends EntityComponent {
	/**
	 * The flag of the flag component.
	 */
	public abstract readonly flag: ActorFlag;

	/**
	 * The default value for the flag component.
	 */
	public abstract readonly defaultValue: boolean;

	/**
	 * Gets the current value of the flag component.
	 * @returns The current value of the flag component.
	 */
	public getCurrentValue(): boolean {
		// Check if the entity has the data flag
		const flag = this.entity.flags.get(this.flag);

		// Check if the data was not found
		if (!flag)
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
		if (sync) this.entity.sync();
	}

	/**
	 * Resets the flag component to the default value.
	 */
	public resetToDefaultValue(): void {
		this.setCurrentValue(this.defaultValue);
	}
}

export { EntityFlagComponent };
