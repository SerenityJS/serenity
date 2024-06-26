import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerNoClipComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.NoClip;

	public readonly defaultValue = false;

	/**
	 * Creates a new player no clip component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player no clip component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.NoClip);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerNoClipComponent };
