import type { ContainerSlotType } from '@serenityjs/bedrock-protocol';
import type { Entity } from '../Entity.js';
import type { EntityContainer } from '../index.js';
import { EntityComponent } from '../index.js';

/**
 * Represents a cursor component of an entity.
 */
class EntityCursorComponent extends EntityComponent {
	public readonly type = 'minecraft:cursor';

	/**
	 * The container of the inventory.
	 */
	public readonly container: EntityContainer;

	/**
	 * The type of the container.
	 */
	public readonly containerType: ContainerSlotType;

	/**
	 * Initializes the inventory component.
	 *
	 * @param entity - The entity this component is attached to.
	 * @param container - The container of the inventory.
	 */
	public constructor(entity: Entity, container: EntityContainer) {
		super(entity);
		this.container = container;
		this.containerType = container.type;
	}
}

export { EntityCursorComponent };
