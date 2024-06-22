import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerFlySpeedComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.FlySpeed;

	public readonly defaultValue = true;

	/**
	 * Creates a new player fly speed component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player fly speed component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.FlySpeed);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerFlySpeedComponent };
