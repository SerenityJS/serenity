import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerWorldBuilderComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.WorldBuilder;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player world builder component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player world builder component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.WorldBuilder);
	}
}

export { PlayerWorldBuilderComponent };
