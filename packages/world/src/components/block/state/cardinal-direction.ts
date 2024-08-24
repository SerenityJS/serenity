import { CardinalDirection } from "../../../enums";

import { BlockStateComponent } from "./state";

import type { Player } from "../../../player";
import type { Block } from "../../../block";

class BlockCardinalDirectionComponent extends BlockStateComponent {
	public static readonly identifier = "minecraft:cardinal_direction";

	public static readonly state = this.identifier;

	public constructor(block: Block) {
		super(block, BlockCardinalDirectionComponent.identifier);
	}

	public onPlace(player: Player): void {
		// Get the player's cardinal direction
		const direction = player.getCardinalDirection();

		// Flip south and north, north and south; east and west, west and east
		const cardinal =
			direction === CardinalDirection.South
				? CardinalDirection.North
				: direction === CardinalDirection.North
					? CardinalDirection.South
					: direction === CardinalDirection.East
						? CardinalDirection.West
						: CardinalDirection.East;

		// Set the direction of the block
		this.setDirection(cardinal);
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 */
	public setDirection(direction: CardinalDirection): void {
		// Get the block type
		const type = this.block.getType();

		// Get the permutation of the block
		const permutation = type.getPermutation({
			[BlockCardinalDirectionComponent.state]:
				CardinalDirection[direction].toLowerCase()
		});

		// Set the permutation of the block
		if (permutation)
			this.block.setPermutation(permutation, { clearComponents: false });
	}
}

export { BlockCardinalDirectionComponent };
