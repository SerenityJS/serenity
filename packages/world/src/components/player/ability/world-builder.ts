import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerWorldBuilderComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.WorldBuilder;

	public readonly defaultValue = true;

	/**
	 * Creates a new player world builder component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player world builder component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.WorldBuilder);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerWorldBuilderComponent };
