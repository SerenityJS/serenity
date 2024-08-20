import { WorldEvent } from "../enums";

import { BlockUpdateSignal } from "./block-update";

import type { Block } from "../block";
import type { Player } from "../player";

class PlayerOpenDoorSignal extends BlockUpdateSignal {
	public static readonly identifier = WorldEvent.PlayerOpenDoor;

	/**
	 * The player that opened the door.
	 */
	public readonly player: Player;

	/**
	 * The previous state of the door.
	 */
	public readonly previousState: boolean;

	/**
	 * The new state of the door.
	 */
	public readonly newState: boolean;

	/**
	 * Creates a new player open door signal.
	 */
	public constructor(
		block: Block,
		player: Player,
		previousState: boolean,
		newState: boolean
	) {
		super(block);
		this.player = player;
		this.previousState = previousState;
		this.newState = newState;
	}
}

export { PlayerOpenDoorSignal };
