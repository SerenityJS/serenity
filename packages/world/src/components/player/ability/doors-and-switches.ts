import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerDoorsAndSwitchesComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.DoorsAndSwitches;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player doors and switches component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player doors and switches component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.DoorsAndSwitches);
	}
}

export { PlayerDoorsAndSwitchesComponent };
