import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerMineComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Mine;

	public readonly defaultValue = true;

	/**
	 * Creates a new player mine component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player mine component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Mine);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerMineComponent };
