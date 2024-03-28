import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerOpenContainersComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.OpenContainers;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player open containers component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player open containers component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.OpenContainers);
	}
}

export { PlayerOpenContainersComponent };
