import { EntityComponent } from "../../entity";

import type { Player } from "../player";

abstract class PlayerComponent extends EntityComponent {
	/**
	 * Initializes the component.
	 *
	 * @param player - The player this component is attached to.
	 */
	public constructor(player: Player) {
		super(player);
	}
}

export { PlayerComponent };
