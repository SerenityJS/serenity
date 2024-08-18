import { ContainerId, ContainerType, Vector3f } from "@serenityjs/protocol";
import { BlockIdentifier } from "@serenityjs/block";

import { BlockContainer } from "../../container";

import { BlockComponent } from "./block-component";

import type { Player } from "../../player";
import type { Block } from "../../block";

class BlockInventoryComponent extends BlockComponent {
	public static readonly identifier = "minecraft:inventory";

	/**
	 * The type of container.
	 */
	public readonly containerType: ContainerType;

	/**
	 * The identifier of the container.
	 */
	public readonly containerId: ContainerId;

	/**
	 * The size of the inventory.
	 */
	public readonly inventorySize: number;

	/**
	 * The container of the inventory.
	 */
	public readonly container: BlockContainer;

	/**
	 * Creates a new inventory component for a block.
	 * @param block The block the component is binded to.
	 */
	public constructor(block: Block) {
		super(block, BlockInventoryComponent.identifier);

		console.log("BlockInventoryComponent created");

		// Create the container for the block based on the block type
		switch (block.getType().identifier) {
			default: {
				// Set the container type and id
				this.containerType = ContainerType.Container;
				this.containerId = ContainerId.Ui;
				this.inventorySize = 27;
				break;
			}

			case BlockIdentifier.CraftingTable: {
				// Set the container type and id
				this.containerType = ContainerType.Workbench;
				this.containerId = ContainerId.Ui;
				this.inventorySize = 9;
				break;
			}

			case BlockIdentifier.LitFurnace:
			case BlockIdentifier.Furnace: {
				// Set the container type and id
				this.containerType = ContainerType.Furnace;
				this.containerId = ContainerId.Ui;
				this.inventorySize = 3;
				break;
			}
		}

		// Create the container for the block
		this.container = new BlockContainer(
			block,
			this.containerType,
			this.containerId,
			this.inventorySize
		);
	}

	public onInteract(player: Player): void {
		// Check if the player is sneaking
		if (!player.isSneaking) {
			// Show the container to the player
			this.container.show(player);
		}
	}

	public onBreak(player?: Player): void {
		// Check if a player is provided
		if (!player) return;

		// Loop through the items in the container
		for (const item of this.container.storage) {
			// Check if the item is valid
			if (!item) continue;

			// Spawn the item in the world
			const { x, y, z } = this.block.position;
			const entity = player.dimension.spawnItem(
				item,
				new Vector3f(x + 0.5, y + 0.5, z + 0.5)
			);

			// Add some upwards velocity to the item.
			entity.setMotion(new Vector3f(0, 0.1, 0));
		}
	}
}

export { BlockInventoryComponent };
