import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerDoorsAndSwitchesComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.DoorsAndSwitches;

	public readonly defaultValue = true;

	/**
	 * Creates a new player doors and switches component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player doors and switches component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.DoorsAndSwitches);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerDoorsAndSwitchesComponent };
