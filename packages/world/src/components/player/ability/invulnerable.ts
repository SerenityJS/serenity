import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerInvulnerableComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.Invulnerable;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player invulnerable component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player invulnerable component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.Invulnerable);
	}
}

export { PlayerInvulnerableComponent };
