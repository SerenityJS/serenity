import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerMutedComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Muted;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player muted component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player muted component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Muted);
	}
}

export { PlayerMutedComponent };
