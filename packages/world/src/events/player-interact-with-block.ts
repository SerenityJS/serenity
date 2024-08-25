import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { BlockFace, Vector3f } from "@serenityjs/protocol";
import type { Block } from "../block";
import type { ItemStack } from "../item";
import type { Player } from "../player";

class PlayerInteractWithBlockSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerInteractWithBlock;

	/**
	 * The player interacting with the block.
	 */
	public readonly player: Player;

	/**
	 * The block being interacted with.
	 */
	public readonly block: Block;

	/**
	 * The face of the block that is being interacted with.
	 */
	public readonly blockFace: BlockFace;

	/**
	 * The location relative to the bottom north-west corner of the block where the interaction is taking place.
	 */
	public readonly faceLocation: Vector3f;

	/**
	 * The item stack that is being used to interact with the block, or null if empty hand.
	 */
	public readonly itemStack: ItemStack | null;

	/**
	 * Creates a new player interact with block signal.
	 * @param player The player interacting with the block.
	 * @param block The block being interacted with.
	 * @param blockFace The face of the block that is being interacted with.
	 * @param faceLocation The location relative to the bottom north-west corner of the block where the interaction is taking place.
	 * @param itemStack The item stack that is being used to interact with the block, or null if empty hand.
	 */
	public constructor(
		player: Player,
		block: Block,
		blockFace: BlockFace,
		faceLocation: Vector3f,
		itemStack: ItemStack | null
	) {
		super(player.dimension.world);
		this.player = player;
		this.block = block;
		this.blockFace = blockFace;
		this.faceLocation = faceLocation;
		this.itemStack = itemStack;
	}
}

export { PlayerInteractWithBlockSignal };
