import {
	MetadataFlags,
	MetadataKey,
	MetadataType,
	SetEntityDataPacket
} from "@serenityjs/protocol";

import { EntityComponent } from "../entity-component";

abstract class EntityMetadataComponent extends EntityComponent {
	/**
	 * The identifier of the component.
	 */
	public abstract readonly identifier: string;

	/**
	 * The flag of the metadata component.
	 */
	public abstract readonly flag: boolean;

	/**
	 * The key of the metadata component.
	 */
	public abstract readonly key: MetadataFlags | MetadataKey;

	/**
	 * The type of the metadata component.
	 */
	public abstract readonly type: MetadataType;

	/**
	 * The default value for the metadata component.
	 */
	public abstract readonly defaultValue: bigint | boolean | number | string;

	/**
	 * The current value of the metadata component.
	 */
	public abstract currentValue: bigint | boolean | number | string;

	/**
	 * Sets the current value of the metadata component.
	 * @param value The value to set.
	 */
	public setCurrentValue(value: bigint | boolean | number | string): void {
		// Set the current value
		this.currentValue = value;

		// Create a new SetEntityDataPacket
		const packet = new SetEntityDataPacket();

		// Set the packet properties
		packet.runtimeEntityId = this.entity.runtime;
		packet.metadata = this.entity.getMetadatas().map((entry) => {
			return {
				key: entry.flag ? MetadataKey.Flags : (entry.key as MetadataKey),
				type: entry.type,
				value: entry.currentValue,
				flag: entry.flag ? (entry.key as MetadataFlags) : undefined
			};
		});
		packet.properties = {
			ints: [],
			floats: []
		};
		packet.tick = 0n; // TODO

		// Broadcast the packet to the dimension.
		this.entity.dimension.broadcast(packet);
	}

	/**
	 * Resets the metadata component to the default value.
	 */
	public resetToDefaultValue(): void {
		this.setCurrentValue(this.defaultValue);
	}
}

export { EntityMetadataComponent };
