import {
	DataItem,
	type ActorDataId,
	type ActorDataType
} from "@serenityjs/protocol";

import { EntityComponent } from "../entity-component";

abstract class EntityDataComponent<T = unknown> extends EntityComponent {
	/**
	 * The key of the metadata component.
	 */
	public abstract readonly key: ActorDataId;

	/**
	 * The type of the metadata component.
	 */
	public abstract readonly type: ActorDataType;

	/**
	 * The default value for the metadata component.
	 */
	public abstract readonly defaultValue: T;

	/**
	 * Gets the current value of the metadata component.
	 * @returns The current value of the metadata component.
	 */
	public getCurrentValue(): T {
		// Check if the entity has the data key
		const data = [...this.entity.metadata].find(
			(x) => x.identifier === this.key
		);

		// Check if the data was not found
		if (!data)
			// Throw an error as this should never happen if the component was set up correctly
			throw new Error(`The entity does not have the ${this.key} data.`);

		// Return the value of the data
		return data.value as T;
	}

	/**
	 * Sets the current value of the metadata component.
	 * @param value The value to set.
	 */
	public setCurrentValue(value: T, sync = true): void {
		// Check if the entity has the data key
		let data = [...this.entity.metadata].find((x) => x.identifier === this.key);

		// Delete the data if it exists
		if (data) this.entity.metadata.delete(data);

		// Create a new data item with the value
		data = new DataItem(this.key, this.type, value);

		// Add the data to the entity
		this.entity.metadata.add(data);

		// Check if the data should be synced
		if (sync) this.entity.sync();
	}

	/**
	 * Resets the metadata component to the default value.
	 */
	public resetToDefaultValue(): void {
		this.setCurrentValue(this.defaultValue);
	}
}

export { EntityDataComponent };
