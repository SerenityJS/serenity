import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerMutedComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Muted;

	public readonly defaultValue = false;

	/**
	 * Creates a new player muted component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player muted component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Muted);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerMutedComponent };
