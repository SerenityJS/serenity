import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerOperatorCommandsComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.OperatorCommands;

	public readonly defaultValue = this.player.permission >= 2;

	/**
	 * Creates a new player operator commands component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player operator commands component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.OperatorCommands);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerOperatorCommandsComponent };
