import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerLightningComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Lightning;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player lightning component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player lightning component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Lightning);
	}
}

export { PlayerLightningComponent };
