import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerInstantBuildComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.InstantBuild;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player instant build component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player instant build component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.InstantBuild);
	}
}

export { PlayerInstantBuildComponent };
