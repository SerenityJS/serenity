import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerMayFlyComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.MayFly;

	public readonly defaultValue = true;

	/**
	 * Creates a new player may fly component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player may fly component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.MayFly);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerMayFlyComponent };
