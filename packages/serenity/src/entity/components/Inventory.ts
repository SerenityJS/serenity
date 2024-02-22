import type { ContainerSlotType } from '@serenityjs/bedrock-protocol';
import type { Entity } from '../Entity.js';
import type { EntityContainer } from '../container/index.js';
import { EntityComponent } from './Component.js';

/**
 * Represents an inventory component of an entity.
 */
class EntityInventoryComponent extends EntityComponent {
	public readonly type = 'minecraft:inventory';

	/**
	 * The container of the inventory.
	 */
	public readonly container: EntityContainer;

	/**
	 * The type of the container.
	 */
	public readonly containerType: ContainerSlotType;

	/**
	 * The size of the inventory.
	 */
	public readonly inventorySize: number;

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
		this.inventorySize = container.size;
	}
}

export { EntityInventoryComponent };
