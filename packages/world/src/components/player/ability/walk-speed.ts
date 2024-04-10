import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerWalkSpeedComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.WalkSpeed;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player walk speed component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player walk speed component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.WalkSpeed);
	}
}

export { PlayerWalkSpeedComponent };
