import { EntityAttributeComponent } from "../../../entity";

import type { Player } from "../../player";

abstract class PlayerAttributeComponent extends EntityAttributeComponent {
	/**
	 * Initializes the component.
	 *
	 * @param player - The player this component is attached to.
	 */
	public constructor(player: Player) {
		super(player);
	}
}

export { PlayerAttributeComponent };
