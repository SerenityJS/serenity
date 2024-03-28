import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerBuildComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Build;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player build component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player build component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Build);
	}
}

export { PlayerBuildComponent };
