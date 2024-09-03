import { BlockCoordinates, BlockFace } from "@serenityjs/protocol";
import { BlockIdentifier } from "@serenityjs/block";

import { BlockComponent } from "./block-component";

import type { Block } from "../../block";

// TODO: Implement falling block logic
class BlockSupportedComponent extends BlockComponent {
	public static readonly identifier = "minecraft:supported";
	public static readonly types: Array<BlockIdentifier> = [
		BlockIdentifier.Torch,
		BlockIdentifier.RedstoneTorch,
		BlockIdentifier.SoulTorch,
		BlockIdentifier.Scaffolding
	];

	// The faces the block can hold into, defaults to bottom
	public holdedBy: Array<BlockFace> = [BlockFace.Bottom];

	public shouldDrop: boolean = true;

	public constructor(block: Block) {
		super(block, BlockSupportedComponent.identifier);
	}

	// Implement a check to see if the block has any support block
	public onTick(): void {
		// Get the support block faces, and check if its not air
		const supportBlocks = this.holdedBy
			.map((face) => this.block.face(face))
			.filter((block) => !block.isAir());

		// If there are support blocks, return
		if (supportBlocks.length > 0) return;
		// Destroy the block
		if (this.shouldDrop) {
			this.block.dimension.spawnItem(
				this.block.getItemStack(),
				this.block.position.add(new BlockCoordinates(0, 0.5, 0))
			);
		}
		this.block.destroy();
	}
}

export { BlockSupportedComponent };
