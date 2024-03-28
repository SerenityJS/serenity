import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerNoClipComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.NoClip;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player no clip component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player no clip component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.NoClip);
	}
}

export { PlayerNoClipComponent };
