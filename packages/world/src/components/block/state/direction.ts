import { CardinalDirection } from "../../../enums";

import { BlockStateComponent } from "./state";

import type { Player } from "../../../player";
import type { Block } from "../../../block";

class BlockDirectionComponent extends BlockStateComponent {
	public static readonly identifier = "minecraft:direction";

	public static readonly state = "direction";

	public constructor(block: Block) {
		super(block, BlockDirectionComponent.identifier);
	}

	public onPlace(player: Player): void {
		// Get the player's cardinal direction
		const direction = player.getCardinalDirection();

		// 1 = south
		// 2 = north
		// 3 = east
		// 4 = west

		switch (direction) {
			case CardinalDirection.South: {
				this.setDirection(2);

				break;
			}
			case CardinalDirection.North: {
				this.setDirection(0);

				break;
			}
			case CardinalDirection.East: {
				this.setDirection(1);

				break;
			}
			default: {
				this.setDirection(3);
			}
		}

		// Set the direction of the block
		// this.setDirection(direction);
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
			direction: direction
		});

		// Set the permutation of the block
		if (permutation)
			this.block.setPermutation(permutation, { clearComponents: false });
	}
}

export { BlockDirectionComponent };
