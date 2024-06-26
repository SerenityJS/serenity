import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerAttackPlayersComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.AttackPlayers;

	public readonly defaultValue = true;

	/**
	 * Creates a new player attack players component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player attack players component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.AttackPlayers);

		// Set the player ability
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerAttackPlayersComponent };
