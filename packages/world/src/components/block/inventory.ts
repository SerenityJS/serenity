import { ContainerId, ContainerType, Vector3f } from "@serenityjs/protocol";

import { BlockContainer } from "../../container";

import { BlockComponent } from "./block-component";

import type { Player } from "../../player";
import type { Block } from "../../block";

class BlockInventoryComponent extends BlockComponent {
	public static readonly identifier = "minecraft:inventory";

	public readonly containerType: ContainerType = ContainerType.Container;

	public readonly containerId: ContainerId = ContainerId.Ui;

	public readonly inventorySize: number = 27;

	public container: BlockContainer;

	public selectedSlot: number = 0;

	public constructor(block: Block) {
		super(block, BlockInventoryComponent.identifier);
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
			entity.setMotion(new Vector3f(0, 0.25, 0));
		}
	}
}

export { BlockInventoryComponent };
