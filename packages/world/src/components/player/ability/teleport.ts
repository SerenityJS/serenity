import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { Player } from "../../../player";

import { PlayerAbilityComponent } from "./ability";

class PlayerTeleportComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Teleport;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player teleport component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player teleport component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Teleport);
	}
}

export { PlayerTeleportComponent };
