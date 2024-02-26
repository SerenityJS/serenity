import { ContainerSlotType } from '@serenityjs/bedrock-protocol';
import type { Entity } from '../Entity.js';
import { EntityContainer, EntityComponent } from '../index.js';

// TODO: Need to be moved to player/components/Cursor.ts
// Non player entities can not have a cursor component

/**
 * Represents a cursor component of an entity.
 */
class EntityCursorComponent extends EntityComponent {
	/**
	 * The type of the component.
	 */
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
	 */
	public constructor(entity: Entity) {
		super(entity);
		this.containerType = ContainerSlotType.Cursor;
		this.container = new EntityContainer(entity, this.containerType, 1);
	}
}

export { EntityCursorComponent };
