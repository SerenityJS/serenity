import type { Block } from "../block";
import type { Entity } from "../entity";
import type { ItemUseCause } from "../enums";
import type { Player } from "../player";

interface ItemUseOptions {
	/**
	 * The player that is using the item.
	 */
	player: Player;

	/**
	 * The cause of the item use. (Break, Place, Use)
	 */
	cause: ItemUseCause;

	/**
	 * The targeted block during the item use.
	 */
	targetBlock?: Block;

	/**
	 * The targeted entity during the item use.
	 */
	targetEntity?: Entity;
}

export { ItemUseOptions };
