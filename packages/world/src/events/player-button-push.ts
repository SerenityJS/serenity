import { WorldEvent } from "../enums";

import { BlockUpdateSignal } from "./block-update";

import type { Block } from "../block";
import type { Player } from "../player";

class PlayerButtonPushSignal extends BlockUpdateSignal {
	public static readonly identifier = WorldEvent.PlayerButtonPush;

	/**
	 * The player that pushed the button.
	 */
	public readonly player: Player;

	/**
	 * The tick the button will release.
	 */
	public releaseTick: bigint;

	public constructor(block: Block, player: Player, releaseTick: bigint) {
		super(block);
		this.player = player;
		this.releaseTick = releaseTick;
	}
}

export { PlayerButtonPushSignal };
