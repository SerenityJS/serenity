import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerFlyingComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Flying;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player flying component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player flying component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Flying);
	}
}

export { PlayerFlyingComponent };
