import {
	BlockIdentifier,
	BlockPermutation,
	type FurnaceBlock,
	type LitFurnaceBlock
} from "@serenityjs/block";
import {
	ContainerDataType,
	ContainerSetDataPacket
} from "@serenityjs/protocol";

import { FurnaceSmeltSignal } from "../../events";

import { BlockComponent } from "./block-component";
import { BlockInventoryComponent } from "./inventory";

import type { CompoundTag } from "@serenityjs/nbt";
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

		// console.log(
		// 	`Burn time: ${this.burnTime}, Burn duration: ${this.burnDuration}, Cook time: ${this.cookTime}`
		// );

		// Get the ingredient item
		const ingredient = inventory.container.getItem(0);

		if (this.burnTime > 0 && this.burnDuration > 0) {
			// Check if the ingredient is still present
			// If so, increment the cook time
			if (ingredient && ingredient.isSmeltable()) this.cookTime++;
			// If not, reset the cook time
			else this.cookTime = 0;

			// Decrement the burn time
			this.burnTime--;

			// Check if the block type is not a lit furnace
			// If so, transform the block to a lit furnace
			if (this.block.getType().identifier !== BlockIdentifier.LitFurnace)
				this.transform(true);

			// Get the resultant item from the container
			const resultant = inventory.container.getItem(2);

			// Check if the resultant item and ingredient item are present
			if (resultant && ingredient) {
				// Get the smeltable component
				const smeltable = ingredient.getComponent("minecraft:smeltable");

				// Check if the resultant item will be compatible with the current resultant item
				if (
					resultant.type.identifier !== smeltable.resultant.identifier ||
					resultant.amount >= resultant.maxAmount ||
					resultant.metadata !== smeltable.metadata
				) {
					// Reset the cook time as the resultant item is not compatible
					this.cookTime = 0;
				}
			}
		}

		// Check if the item is done cooking
		if (this.burnTime >= 0 && this.cookTime >= 200) {
			// Reset the cook time
			this.cookTime = 0;

			// Check if the ingredient is still present and is smeltable
			if (ingredient && ingredient.isSmeltable()) {
				// Get the smeltable component
				const smeltable = ingredient.getComponent("minecraft:smeltable");

				// Get the resultant item type
				const resultant = smeltable.smelt();

				// Create a new FurnaceSmeltSignal
				const signal = new FurnaceSmeltSignal(
					this.block,
					ingredient,
					resultant
				);

				// Emit the signal
				const value = signal.emit();

				// Check if the signal was cancelled
				if (value) {
					// Add the resultant to the container of the ingredient as the signal was not cancelled
					if (ingredient.container) ingredient.container.addItem(resultant);
				} else {
					// Increment the ingredient item count as the signal was cancelled
					ingredient.increment();
				}
			}
		}

		if (this.burnTime <= 0) {
			// Get the fuel and ingredient items
			const fuel = inventory.container.getItem(1);
			const ingredient = inventory.container.getItem(0);

			if (fuel && ingredient) {
				this.burnDuration = 1600;
				this.burnTime = 1600;
				this.cookTime = 0;

				// Decrement the fuel item count
				fuel.decrement();
			} else {
				if (this.block.getType().identifier === BlockIdentifier.LitFurnace)
					this.transform(false);
			}
		}

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
			tickCount.value = this.cookTime;

			player.session.send(burnTime, burnDuration, tickCount);
		}
	}

	public static serialize(
		nbt: CompoundTag,
		component: BlockFurnaceComponent
	): void {
		nbt.createIntTag("BurnTime", component.burnTime);
		nbt.createIntTag("BurnDuration", component.burnDuration);
		nbt.createIntTag("CookTime", component.cookTime);
	}

	public static deserialize(
		nbt: CompoundTag,
		block: Block
	): BlockFurnaceComponent {
		const component = new BlockFurnaceComponent(block);

		component.burnTime = nbt.getTag("BurnTime")?.value as number;
		component.burnDuration = nbt.getTag("BurnDuration")?.value as number;
		component.cookTime = nbt.getTag("CookTime")?.value as number;

		return component;
	}
}

export { BlockFurnaceComponent };
