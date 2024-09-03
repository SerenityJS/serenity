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

	/**
	 * The block face that should support the block.
	 */
	public heldedBy: Array<BlockFace> = [BlockFace.Bottom];

	/**
	 * Whether the block should drop an item when not supported.
	 */
	public shouldDrop: boolean = true;

	/**
	 * Creates a new block supported component.
	 * @param block The block the component is binded to.
	 */
	public constructor(block: Block) {
		super(block, BlockSupportedComponent.identifier);
	}

	public onUpdate(): void {
		// Get the support block faces, and check if its not air
		const supportBlocks = this.heldedBy
			.map((face) => this.block.face(face))
			.filter((block) => !block.isAir());

		// If there are support blocks, return
		if (supportBlocks.length > 0) return;

		// Check if the block should drop
		if (this.shouldDrop) {
			// Get the item stack of the block
			const itemStack = this.block.getItemStack();

			// Get the position of the block
			const position = this.block.position.add(
				new BlockCoordinates(0.5, 0, 0.5)
			);

			// Spawn the item stack entity
			this.block.dimension.spawnItem(itemStack, position);
		}

		// Destroy the block
		this.block.destroy();
	}
}

export { BlockSupportedComponent };
