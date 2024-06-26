import { CardinalDirection } from "../../enums";

import { BlockComponent } from "./block-component";

import type { Player } from "../../player";
import type { Block } from "../../block";

class BlockDirectionalComponent extends BlockComponent {
	public static readonly identifier = "minecraft:directional";

	/**
	 * Creates a new directional component.
	 *
	 * @param block The block the component is binded to.
	 * @returns A new directional component.
	 */
	public constructor(block: Block) {
		super(block, BlockDirectionalComponent.identifier);
	}

	public onPlace(player?: Player): void {
		// console.log(player?.username)

		if (player) {
			this.setDirection(player.getCardinalDirection());
		}
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 */
	public setDirection(direction: CardinalDirection): void {
		// Get the permutation and type of the block
		const permutation = this.block.permutation;
		const type = permutation.type;

		// Get the keys of the permutation state
		const keys = Object.keys(permutation.state);

		// Loop through the keys of the permutation state
		for (const key of keys) {
			switch (key) {
				default: {
					break;
				}

				case "weirdo_direction": {
					const permutation = type.getPermutation({
						weirdo_direction: direction
					});

					if (permutation) {
						this.block.setPermutation(permutation);
					}

					break;
				}

				case "minecraft:cardinal_direction": {
					// Flip south and north, north and south; east and west, west and east
					const cardinal =
						direction === CardinalDirection.South
							? CardinalDirection.North
							: direction === CardinalDirection.North
								? CardinalDirection.South
								: direction === CardinalDirection.East
									? CardinalDirection.West
									: CardinalDirection.East;

					const permutation = type.getPermutation({
						"minecraft:cardinal_direction":
							CardinalDirection[cardinal].toLowerCase()
					});

					if (permutation) {
						this.block.setPermutation(permutation);
					}

					break;
				}
			}
		}
	}
}

export { BlockDirectionalComponent };
