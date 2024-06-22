import {
	MetadataDictionary,
	type MetadataFlags,
	type MetadataKey,
	type MetadataType,
	type Vector3f
} from "@serenityjs/protocol";

import { EntityComponent } from "../entity-component";

abstract class EntityMetadataComponent extends EntityComponent {
	/**
	 * The key of the metadata component.
	 */
	public abstract readonly key: MetadataKey;

	/**
	 * The type of the metadata component.
	 */
	public abstract readonly type: MetadataType;

	/**
	 * The default value for the metadata component.
	 */
	public abstract readonly defaultValue: bigint | boolean | number | string;

	/**
	 * The flag of the metadata component.
	 */
	public readonly flag?: MetadataFlags;

	/**
	 * Gets the current value of the metadata component.
	 * @returns The current value of the metadata component.
	 */
	public getCurrentValue(): bigint | boolean | number | string | Vector3f {
		// Check if the metadata component is a flag
		if (this.flag) {
			// Check if the entity has the flag
			const flag = this.entity.getFlag(this.flag);

			// Check if the flag is not found
			if (!flag)
				throw new Error(`The entity "${this.key}" flag was not found.`);

			// Return the value of the flag
			return flag.value;
		} else {
			//Get the data of the metadata component
			const data = this.entity.getData(this.key as MetadataKey);

			// Check if the data is not found
			if (!data)
				throw new Error(`The entity "${this.key}" value was not found.`);

			// Return the value of the data
			return data.value;
		}
	}

	/**
	 * Sets the current value of the metadata component.
	 * @param value The value to set.
	 */
	public setCurrentValue(
		value: bigint | boolean | number | string,
		sync = true
	): void {
		// Check if the metadata component is a flag
		if (this.flag) {
			// Check if the entity has the flag
			const has = this.entity.hasFlag(this.flag);
			if (has) {
				// Get the flag
				const has = this.entity.hasFlag(this.flag);

				// Check if the flag is not found
				if (!has)
					throw new Error(
						`The entity has the ${this.key} flag, but the flag is not found.`
					);

				// Set the value of the flag
				this.entity.setFlag(this.flag, value as boolean, sync);
			} else {
				// Create the flag
				const flag = new MetadataDictionary(
					this.key,
					this.type,
					value,
					this.flag
				);

				// Add the flag to the entity
				this.entity.addFlag(flag, sync);
			}
		} else {
			// Check if the entity has the data
			const has = this.entity.hasData(this.key);
			if (has) {
				// Get the data
				const has = this.entity.getData(this.key);

				// Check if the data is not found
				if (!has)
					throw new Error(
						`The entity has the ${this.key} data, but the data is not found.`
					);

				// Set the value of the data
				this.entity.setData(this.key, value, sync);
			} else {
				// Create the data
				const data = new MetadataDictionary(this.key, this.type, value);

				// Add the data to the entity
				this.entity.addData(data, sync);
			}
		}
	}

	/**
	 * Resets the metadata component to the default value.
	 */
	public resetToDefaultValue(): void {
		this.setCurrentValue(this.defaultValue);
	}
}

export { EntityMetadataComponent };
