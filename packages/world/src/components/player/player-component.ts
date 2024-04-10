import { EntityComponent } from "../entity";

import type { Player } from "../../player";

abstract class PlayerComponent extends EntityComponent {
	/**
	 * The entity the component is binded to.
	 */
	protected readonly player: Player;

	/**
	 * Creates a new entity component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity component.
	 */
	public constructor(player: Player, identifier: string) {
		super(player, identifier);
		this.player = player;
	}
}

export { PlayerComponent };
