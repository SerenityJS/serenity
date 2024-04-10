import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

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
