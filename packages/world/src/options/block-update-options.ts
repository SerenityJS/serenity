import type { Player } from "../player";
import type { BlockFace, Vector3f } from "@serenityjs/protocol";

interface BlockUpdateOptions {
	/**
	 * The player that caused the block update.
	 */
	readonly player?: Player;

	/**
	 * The face of the block that was clicked.
	 */
	readonly blockFace?: BlockFace;

	/**
	 * The position of the block that was clicked.
	 */
	readonly clickPosition?: Vector3f;

	/**
	 * Whether to clear the components of the block.
	 */
	readonly clearComponents?: boolean;

	/**
	 * Whether to update the block.
	 */
	readonly updateBlock?: boolean;
}

export { BlockUpdateOptions };
