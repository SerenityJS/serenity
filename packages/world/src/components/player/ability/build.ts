import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerBuildComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Build;

	public readonly defaultValue = true;

	/**
	 * Creates a new player build component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player build component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Build);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerBuildComponent };
