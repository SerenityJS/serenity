import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerTeleportComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Teleport;

	public readonly defaultValue = this.player.permission >= 2;

	/**
	 * Creates a new player teleport component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player teleport component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Teleport);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerTeleportComponent };
