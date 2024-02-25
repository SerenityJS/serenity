import type { Entity } from '../Entity.js';

/**
 * Represents a component of an entity.
 */
abstract class EntityComponent {
	/**
	 * The entity this component is attached to.
	 */
	protected readonly entity: Entity;

	/**
	 * The type of the component.
	 */
	public abstract readonly type: string;

	/**
	 * Initializes the component.
	 *
	 * @param entity - The entity this component is attached to.
	 */
	public constructor(entity: Entity) {
		this.entity = entity;
	}
}

export { EntityComponent };
