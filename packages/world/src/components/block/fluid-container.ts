import {
	BlockIdentifier,
	BlockPermutation,
	type CauldronLiquid
} from "@serenityjs/block";

import { BlockComponent } from "./block-component";

import type { Player } from "../../player";
import type { Block } from "../../block";

class BlockFluidContainerComponent extends BlockComponent {
	public static readonly identifier = "minecraft:cauldron_liquid";

	public static types: Array<BlockIdentifier> = [BlockIdentifier.Cauldron];

	// ? The cauldron permutation fluid level
	public fillLevel: number;

	// ? If empty there is no liquid
	public fluid?: CauldronLiquid;

	public constructor(block: Block) {
		super(block, BlockFluidContainerComponent.identifier);
		this.fillLevel = 0;
	}

	public onInteract(player: Player): void {
		// ? Get the player held item and his fluid container component
		const playerHeldItem = player
			.getComponent("minecraft:inventory")
			.getHeldItem();
		const fluidContainer = playerHeldItem?.getComponent(
			"minecraft:fluid_container"
		);

		// ? Check if there is item and if the fluid container fluid is defined
		if (!playerHeldItem || !fluidContainer?.fluid) return;
		// ? Get the fluid container fluid and calculate the new fluid amount
		const fluid = fluidContainer.fluid;
		const liquidLevel = this.fillLevel + fluidContainer.fluidAmount;

		// ? Check if the fluids mismatches or if the liquid level is greater than the limit
		if ((this.fluid && this.fluid !== fluid) || liquidLevel > 6) return;
		if (!this.fluid) this.fluid = fluid as CauldronLiquid;
		// ? Set the new permutation with the fluid and the new liquid level

		this.block.setPermutation(
			BlockPermutation.resolve(BlockIdentifier.Cauldron, {
				fill_level: liquidLevel,
				cauldron_liquid: this.fluid
			})
		);
	}
}

export { BlockFluidContainerComponent };
