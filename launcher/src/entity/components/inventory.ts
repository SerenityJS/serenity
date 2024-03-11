import { ContainerSlotType, PlayerHotbar } from "@serenityjs/protocol";

import { Player } from "../../player";
import { EntityContainer } from "../container";

import { EntityComponent } from "./component";

import type { Entity } from "../entity";

/**
 * Represents an inventory component of an entity.
 */
class EntityInventoryComponent extends EntityComponent {
	/**
	 * The identifier of the component.
	 */
	public readonly identifier = "minecraft:inventory";

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
	 * The selected slot of the inventory.
	 */
	public selectedSlot = 0;

	/**
	 * Initializes the inventory component.
	 *
	 * @param entity - The entity this component is attached to.
	 */
	public constructor(entity: Entity) {
		super(entity);
		this.containerType = ContainerSlotType.Inventory;
		this.inventorySize = 36;
		this.container = new EntityContainer(
			entity,
			this.containerType,
			this.inventorySize
		);
	}

	/**
	 * Selects a slot in the inventory.
	 *
	 * @param slot - The slot to select.
	 */
	public selectSlot(slot: number): void {
		// Check if the entity is a player.
		if (this.entity instanceof Player) {
			// Create a new player hotbar packet.
			const packet = new PlayerHotbar();

			// Set the selected slot of the packet.
			packet.selectedSlot = slot;

			// Set the window id of the packet.
			packet.windowId = 0;

			// Set the select slot of the packet.
			packet.selectSlot = true;

			// Send the packet to the player.
			this.entity.session.send(packet);

			// Set the selected slot of the inventory.
			this.selectedSlot = slot;
		} else {
			// TODO: Add support for non-player entities.

			// Set the selected slot of the inventory.
			this.selectedSlot = slot;
		}
	}
}

export { EntityInventoryComponent };
