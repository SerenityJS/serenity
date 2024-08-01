import {
	BlockIdentifier,
	BlockPermutation,
	type FurnaceBlock,
	type LitFurnaceBlock
} from "@serenityjs/block";
import { ShortTag } from "@serenityjs/nbt";
import {
	ContainerDataType,
	ContainerSetDataPacket
} from "@serenityjs/protocol";

import { BlockComponent } from "./block-component";
import { BlockInventoryComponent } from "./inventory";

import type { Block } from "../../block";

class BlockFurnaceComponent extends BlockComponent {
	public static readonly identifier = "minecraft:furnace";

	public static readonly types = [
		BlockIdentifier.LitFurnace,
		BlockIdentifier.Furnace
	];

	public burnDuration = 0;
	public burnTime = 0;
	public cookTime = 0; // Max 200

	public constructor(block: Block) {
		super(block, BlockFurnaceComponent.identifier);
	}

	protected transform(lit: boolean): void {
		if (lit) {
			// Get the permutation for the lit furnace block
			const permutation = BlockPermutation.resolve(
				BlockIdentifier.LitFurnace,
				this.block.permutation.state as LitFurnaceBlock
			);

			// Set the block permutation
			this.block.setPermutation(permutation, { clearComponents: false });
		} else {
			// Get the permutation for the furnace block
			const permutation = BlockPermutation.resolve(
				BlockIdentifier.Furnace,
				this.block.permutation.state as FurnaceBlock
			);

			// Set the block permutation
			this.block.setPermutation(permutation, { clearComponents: false });
		}
	}

	public onTick(): void {
		// Check if the furnace has a inventory component
		if (!this.block.hasComponent(BlockInventoryComponent.identifier))
			throw new Error("Furnace block does not have a inventory component");

		// Get the inventory component
		const inventory = this.block.getComponent(
			BlockInventoryComponent.identifier
		);

		if (this.burnTime > 0 && this.burnDuration > 0) {
			// Decrement the burn time
			this.burnTime--;

			// Check if the block type is not a lit furnace
			// If so, transform the block to a lit furnace
			if (this.block.getType().identifier !== BlockIdentifier.LitFurnace)
				this.transform(true);
		} else if (this.burnTime <= 0 && this.burnDuration >= 0) {
			console.log("done");
		}

		const fuel = inventory.container.getItem(0);
		const ingredient = inventory.container.getItem(1);

		const viewers = inventory.container.occupants;
		if (viewers.size === 0) return;

		for (const player of viewers) {
			const burnTime = new ContainerSetDataPacket();
			burnTime.containerId = inventory.container.identifier;
			burnTime.type = ContainerDataType.FurnaceLitTime;
			burnTime.value = this.burnTime;

			const burnDuration = new ContainerSetDataPacket();
			burnDuration.containerId = inventory.container.identifier;
			burnDuration.type = ContainerDataType.FurnaceLitDuration;
			burnDuration.value = this.burnDuration;

			const tickCount = new ContainerSetDataPacket();
			tickCount.containerId = inventory.container.identifier;
			tickCount.type = ContainerDataType.FurnanceTickCount;
			tickCount.value = 200 - this.cookTime;

			player.session.send(burnTime, burnDuration, tickCount);
		}
	}
}

export { BlockFurnaceComponent };
