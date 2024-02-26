import { ContainerSlotType } from '@serenityjs/bedrock-protocol';
import type { Entity } from '../Entity.js';
import { EntityContainer } from '../container/index.js';
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
	 */
	public constructor(entity: Entity) {
		super(entity);
		this.containerType = ContainerSlotType.Inventory;
		this.inventorySize = 36;
		this.container = new EntityContainer(entity, this.containerType, this.inventorySize);
	}
}

export { EntityInventoryComponent };
