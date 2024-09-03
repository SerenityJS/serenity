import {
	ActorDataType,
	DataItem,
	type ActorDataId
} from "@serenityjs/protocol";

import { EntityComponent } from "../entity-component";

import type { Entity } from "../../../entity";
import type { CompoundTag } from "@serenityjs/nbt";

class EntityDataComponent<T = unknown> extends EntityComponent {
	/**
	 * The key of the metadata component.
	 */
	public key!: ActorDataId;

	/**
	 * The type of the metadata component.
	 */
	public type!: ActorDataType;

	/**
	 * The default value for the metadata component.
	 */
	public defaultValue!: T;

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
		if (data === undefined)
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

	public static serialize(
		nbt: CompoundTag,
		component: EntityDataComponent
	): void {
		nbt.createByteTag("key", component.key);
		nbt.createByteTag("type", component.type);

		switch (component.type) {
			case ActorDataType.Byte: {
				nbt.createByteTag("current", component.getCurrentValue() as number);
				nbt.createByteTag("default", component.defaultValue as number);
				break;
			}

			case ActorDataType.Short: {
				nbt.createShortTag("current", component.getCurrentValue() as number);
				nbt.createShortTag("default", component.defaultValue as number);
				break;
			}

			case ActorDataType.Int: {
				nbt.createIntTag("current", component.getCurrentValue() as number);
				nbt.createIntTag("default", component.defaultValue as number);
				break;
			}

			case ActorDataType.Long: {
				nbt.createLongTag("current", component.getCurrentValue() as bigint);
				nbt.createLongTag("default", component.defaultValue as bigint);
				break;
			}

			case ActorDataType.Float: {
				nbt.createFloatTag("current", component.getCurrentValue() as number);
				nbt.createFloatTag("default", component.defaultValue as number);
				break;
			}

			case ActorDataType.String: {
				nbt.createStringTag("current", component.getCurrentValue() as string);
				nbt.createStringTag("default", component.defaultValue as string);
				break;
			}
		}
	}

	public static deserialize(
		nbt: CompoundTag,
		entity: Entity
	): EntityDataComponent {
		const key = nbt.getTag("key")?.value as ActorDataId;
		const type = nbt.getTag("type")?.value as ActorDataType;
		const currentValue = nbt.getTag("current")?.value as number;
		const defaultValue = nbt.getTag("default")?.value as number;

		const component = new this(entity, this.identifier);

		component.key = key;
		component.type = type;

		switch (type) {
			case ActorDataType.Byte: {
				component.setCurrentValue(currentValue);
				component.defaultValue = defaultValue;
				break;
			}

			case ActorDataType.Short: {
				component.setCurrentValue(currentValue);
				component.defaultValue = defaultValue;
				break;
			}

			case ActorDataType.Int: {
				component.setCurrentValue(currentValue);
				component.defaultValue = defaultValue;
				break;
			}

			case ActorDataType.Long: {
				component.setCurrentValue(currentValue);
				component.defaultValue = defaultValue;
				break;
			}

			case ActorDataType.Float: {
				component.setCurrentValue(currentValue);
				component.defaultValue = defaultValue;
				break;
			}

			case ActorDataType.String: {
				component.setCurrentValue(currentValue);
				component.defaultValue = defaultValue;
				break;
			}
		}

		return component;
	}
}

export { EntityDataComponent };
