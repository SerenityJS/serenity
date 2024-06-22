import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerOpenContainersComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.OpenContainers;

	public readonly defaultValue = true;

	/**
	 * Creates a new player open containers component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player open containers component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.OpenContainers);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerOpenContainersComponent };
