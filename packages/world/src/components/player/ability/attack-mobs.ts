import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

import type { Player } from "../../../player";

class PlayerAttackMobsComponent extends PlayerAbilityComponent {
	public readonly flag = AbilityLayerFlag.AttackMobs;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new player attack mobs component.
	 *
	 * @param player The player the component is binded to.
	 * @returns A new player attack mobs component.
	 */
	public constructor(player: Player) {
		super(player, AbilitySet.AttackMobs);
	}
}

export { PlayerAttackMobsComponent };
