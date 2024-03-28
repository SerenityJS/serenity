import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerOperatorCommandsComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.OperatorCommands;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player operator commands component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player operator commands component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.OperatorCommands);
	}
}

export { PlayerOperatorCommandsComponent };
