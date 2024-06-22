import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerCountComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Count;

	public readonly defaultValue = false;

	/**
	 * Creates a new player count component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player count component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Count);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerCountComponent };
