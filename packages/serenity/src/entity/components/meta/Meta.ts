import type { MetadataFlags, MetadataKey, MetadataType } from '@serenityjs/bedrock-protocol';
import type { Entity } from '../../Entity.js';
import { EntityComponent } from '../Component.js';

abstract class EntityMetaComponent extends EntityComponent {
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
	 * The constructor of the entity metadata component.
	 *
	 * @param entity The entity to construct the component for.
	 */
	public constructor(entity: Entity) {
		super(entity);

		// Set the default value
		this.resetToDefaultValue();
	}

	/**
	 * Sets the current value of the metadata component.
	 *
	 * @param value The value to set.
	 */
	public setCurrentValue(value: bigint | boolean | number | string): void {
		// Set the value
		this.currentValue = value;

		// Update the entity
		this.entity.dimension.updateEntity(this.entity);
	}

	/**
	 * Resets the current value of the metadata component to the default value.
	 */
	public resetToDefaultValue(): void {
		// Set the current value to the default value
		this.currentValue = this.defaultValue;
	}
}

export { EntityMetaComponent };
